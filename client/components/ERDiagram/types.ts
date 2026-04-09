// ER 图相关类型定义
// 基础类型从 shared 模块导入
export type { ColumnSchema, TableData, RelationshipData } from "@shared/types";

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
