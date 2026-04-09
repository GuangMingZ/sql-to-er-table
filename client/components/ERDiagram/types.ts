// ER 图相关类型定义（基于简化的 SQL 解析结果，不依赖 helix 特定类型）

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

export interface TableColumn {
  type: string;
  nullable: boolean;
  comment: string;
}

export interface ERNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    tableName: string;
    comment: string | null;
    columns: TableColumn[];
    columnNames: string[];
    indexInfo?: {
      primary_key?: string[];
    };
  };
}

export interface EREdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  type?: string;
  data?: {
    relationshipType: string;
    sourceColumn: string;
    targetColumn: string;
  };
}

export interface ERDiagramData {
  nodes: ERNode[];
  edges: EREdge[];
}
