import nodeSqlParser from "node-sql-parser";
import type { TableData, RelationshipData, DatabaseType } from "../../shared/types";

const { Parser } = nodeSqlParser;
const sqlParser = new Parser();

/**
 * node-sql-parser 解析结果中单列定义的结构
 */
interface ColumnDef {
  column: { column: string };
  definition: { dataType: string; length?: number; scale?: number };
  nullable?: { value: number } | { type: string };
  default_val?: { value: { value: string | number } };
  auto_increment?: string;
  comment?: { value: { value: string } };
  unique?: string | null;
}

/**
 * node-sql-parser 解析结果中约束/索引定义的结构
 */
interface ConstraintDef {
  resource: "constraint" | "index";
  constraint_type?: string;
  index_type?: string;
  name?: { value: string } | string;
  definition: Array<{ column: string; expr?: any }>;
  reference_definition?: {
    table: Array<{ table: string; db?: string }>;
    definition: Array<{ column: string }>;
    on_delete?: string;
    on_update?: string;
  };
}

type CreateDefinition = ColumnDef | ConstraintDef;

interface CreateTableAST {
  type: "create";
  keyword: "table";
  table: Array<{ table: string; db?: string }>;
  create_definitions: CreateDefinition[];
  table_options?: Array<{ keyword: string; value: string }>;
}

/**
 * 判断一条定义是否为列定义（而非约束/索引）
 */
function isColumnDef(def: CreateDefinition): def is ColumnDef {
  return "column" in def && def.column != null;
}

/**
 * 判断一条定义是否为约束/索引定义
 */
function isConstraintDef(def: CreateDefinition): def is ConstraintDef {
  return "resource" in def;
}

/**
 * 从 nullable 字段判断是否允许为空
 * node-sql-parser 中：nullable.value=0 表示 NOT NULL，nullable.value=1 表示 NULL
 */
function resolveNullable(nullable: ColumnDef["nullable"]): boolean {
  if (!nullable) return true;
  if ("value" in nullable) return nullable.value !== 0;
  // type: "not null" | "null"
  if ("type" in nullable) return (nullable as any).type !== "not null";
  return true;
}

/**
 * 构建列的类型字符串，例如 VARCHAR(255)、DECIMAL(10,2)
 */
function buildTypeStr(definition: ColumnDef["definition"]): string {
  if (!definition) return "UNKNOWN";
  const base = definition.dataType?.toUpperCase() ?? "UNKNOWN";
  if (definition.length != null && definition.scale != null) {
    return `${base}(${definition.length},${definition.scale})`;
  }
  if (definition.length != null) {
    return `${base}(${definition.length})`;
  }
  return base;
}

/**
 * 从 table_options 数组中提取表注释
 */
function extractTableComment(
  tableOptions?: Array<{ keyword: string; value: string }>
): string | null {
  if (!tableOptions) return null;
  const commentOpt = tableOptions.find(
    (opt) => opt.keyword?.toLowerCase() === "comment"
  );
  if (!commentOpt) return null;
  // 去掉首尾的引号
  return commentOpt.value?.replace(/^['"]|['"]$/g, "") ?? null;
}

/**
 * 将单个 CREATE TABLE AST 解析为 TableData
 */
function parseCreateTableAST(ast: CreateTableAST): {
  tableData: TableData;
  foreignKeys: Array<{ tableName: string; cols: string[]; refTable: string; refCols: string[] }>;
} {
  const tableInfo = ast.table[0];
  const tableName = tableInfo.db
    ? `${tableInfo.db}.${tableInfo.table}`
    : tableInfo.table;

  const schema: TableData["schema"] = {};
  const primaryKeys: string[] = [];
  const foreignKeys: Array<{
    tableName: string;
    cols: string[];
    refTable: string;
    refCols: string[];
  }> = [];

  // 第一轮：先收集 PRIMARY KEY 约束中的列（以便后面标注列）
  const pkFromConstraint: string[] = [];
  for (const def of ast.create_definitions) {
    if (isConstraintDef(def)) {
      const ct = def.constraint_type?.toLowerCase();
      if (ct === "primary key") {
        def.definition.forEach((col) => {
          if (col.column) pkFromConstraint.push(col.column);
        });
      }
    }
  }

  // 第二轮：处理列定义
  for (const def of ast.create_definitions) {
    if (!isColumnDef(def)) continue;

    const colName = def.column.column;
    const typeStr = buildTypeStr(def.definition);
    const nullable = resolveNullable(def.nullable);
    const comment =
      (def.comment?.value?.value as string | undefined) ?? "";

    schema[colName] = {
      type: typeStr,
      nullable,
      comment,
    };

    // 列级 PRIMARY KEY（inline 写法）
    if ((def as any).primary_key) {
      pkFromConstraint.push(colName);
    }
  }

  // 第三轮：处理约束（PRIMARY KEY / FOREIGN KEY）
  for (const def of ast.create_definitions) {
    if (!isConstraintDef(def)) continue;
    const ct = def.constraint_type?.toLowerCase();

    if (ct === "primary key") {
      def.definition.forEach((col) => {
        if (col.column && !primaryKeys.includes(col.column)) {
          primaryKeys.push(col.column);
        }
      });
    } else if (ct === "foreign key") {
      const fkCols = def.definition.map((col) => col.column);
      const refDef = def.reference_definition;
      if (refDef) {
        const refTableInfo = refDef.table[0];
        const refTable = refTableInfo.db
          ? `${refTableInfo.db}.${refTableInfo.table}`
          : refTableInfo.table;
        const refCols = refDef.definition.map((col) => col.column);
        foreignKeys.push({ tableName, cols: fkCols, refTable, refCols });
      }
    }
  }

  // 汇总主键（约束级 + 列级 inline 写法）
  pkFromConstraint.forEach((col) => {
    if (!primaryKeys.includes(col)) primaryKeys.push(col);
  });

  const tableComment = extractTableComment(ast.table_options as any);

  const tableData: TableData = {
    table_name: tableName,
    name: tableName,
    comment: tableComment,
    schema,
    doc: { field_notes: {}, sample_values: {} },
    enum_index_status: {},
    enum_value_count: {},
    enum_exceed_limit: {},
    index_info: primaryKeys.length > 0 ? { primary_key: primaryKeys } : undefined,
  };

  return { tableData, foreignKeys };
}

/**
 * 将 SQL DDL 字符串解析为 ER 图所需的 TableData 数组和 RelationshipData
 * @param sql SQL DDL 字符串
 * @param database 数据库类型，默认为 MySQL
 */
export function parseSqlToERData(sql: string, database: DatabaseType = "MySQL"): {
  tables: TableData[];
  relationships: RelationshipData;
  errors: string[];
} {
  const errors: string[] = [];
  const tables: TableData[] = [];
  const allForeignKeys: Array<{
    tableName: string;
    cols: string[];
    refTable: string;
    refCols: string[];
  }> = [];

  let astList: any[];
  try {
    const result = sqlParser.astify(sql, { database });
    astList = Array.isArray(result) ? result : [result];
  } catch (err: any) {
    errors.push(`SQL 解析失败：${err?.message ?? String(err)}`);
    return { tables, relationships: { relationships: [] }, errors };
  }

  for (const ast of astList) {
    if (ast?.type !== "create" || ast?.keyword !== "table") continue;
    try {
      const { tableData, foreignKeys } = parseCreateTableAST(ast as CreateTableAST);
      tables.push(tableData);
      allForeignKeys.push(...foreignKeys);
    } catch (err: any) {
      const tableName = ast?.table?.[0]?.table ?? "未知表";
      errors.push(`解析表 ${tableName} 失败：${err?.message ?? String(err)}`);
    }
  }

  // 将外键转换为关系数组格式 [source.tableName.column, target.tableName.column]
  // ERDiagramParser 的解析规则：field.split('.') 取最后一段为列名，其余为表名
  const relationships: string[][] = [];
  for (const fk of allForeignKeys) {
    for (let i = 0; i < fk.cols.length; i++) {
      const srcCol = fk.cols[i];
      const tgtCol = fk.refCols[i] ?? fk.refCols[0];
      if (srcCol && tgtCol) {
        relationships.push([
          `${fk.tableName}.${srcCol}`,
          `${fk.refTable}.${tgtCol}`,
        ]);
      }
    }
  }

  return { tables, relationships: { relationships }, errors };
}
