/**
 * 前后端共享的 ER 图相关类型定义
 */

export interface ColumnSchema {
  type: string;
  nullable: boolean;
  comment: string;
}

export interface TableData {
  table_name: string;
  name: string;
  comment: string | null;
  schema: Record<string, ColumnSchema>;
  doc: {
    field_notes: Record<string, string>;
    sample_values: Record<string, any[]>;
  };
  enum_index_status: Record<string, any>;
  enum_value_count: Record<string, any>;
  enum_exceed_limit: Record<string, boolean>;
  index_info?: {
    primary_key?: string[];
  };
}

export interface RelationshipData {
  relationships: string[][];
}

/**
 * 支持的数据库类型
 */
export type DatabaseType =
  | "Athena"
  | "BigQuery"
  | "DB2"
  | "Hive"
  | "MariaDB"
  | "MySQL"
  | "PostgresQL"
  | "Redshift"
  | "Sqlite"
  | "TransactSQL"
  | "FlinkSQL";

/**
 * SQL 解析请求参数
 */
export interface ParseSqlRequest {
  /** AES-256-GCM 加密的 SQL 字符串 */
  payload: string;
  /** 数据库类型，默认为 MySQL */
  database?: DatabaseType;
}

/**
 * SQL 解析响应结果
 */
export interface ParseSqlResponse {
  success: boolean;
  data?: {
    tables: TableData[];
    relationships: RelationshipData;
  };
  errors: string[];
}
