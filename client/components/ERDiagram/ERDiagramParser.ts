import { ERDiagramData, EREdge, ERNode, RelationshipData, TableData } from "./types";
import { getRelationshipType } from "./utils";

/**
 * ER 图解析工具类
 * 将 TableData 数组和关系数据转换为 React Flow 可用的节点/边数据
 */
export class ERDiagramParser {
  private tables: Map<string, TableData> = new Map();
  private relationships: string[][] = [];

  addTable(tableData: TableData): void {
    this.tables.set(tableData.table_name, tableData);
  }

  addTables(tablesData: TableData[]): void {
    tablesData.forEach((table) => this.addTable(table));
  }

  setRelationships(relationshipData: RelationshipData): void {
    this.relationships = relationshipData.relationships;
  }

  private calculateNodePosition(index: number, totalNodes: number): { x: number; y: number } {
    if (totalNodes === 1) return { x: 200, y: 200 };

    if (totalNodes <= 4) {
      const positions = [
        { x: 25, y: 25 },
        { x: 600, y: 25 },
        { x: 25, y: 400 },
        { x: 600, y: 500 },
      ];
      return positions[index] ?? { x: 100, y: 100 };
    }

    const cols = this.calculateOptimalColumns(totalNodes);
    const col = index % cols;
    const row = Math.floor(index / cols);
    const horizontalSpacing = 500;
    const verticalSpacing = 350;
    const offsetX = 50;
    const offsetY = 50;

    return {
      x: offsetX + col * horizontalSpacing,
      y: offsetY + row * verticalSpacing,
    };
  }

  private calculateOptimalColumns(totalNodes: number): number {
    if (totalNodes <= 2) return totalNodes;
    if (totalNodes <= 6) return 3;
    if (totalNodes <= 12) return 4;
    if (totalNodes <= 20) return 5;
    return Math.min(Math.ceil(Math.sqrt(totalNodes * 1.618)), 6);
  }

  private parseRelationshipField(field: string): { tableName: string; columnName: string } {
    const parts = field.split(".");
    if (parts.length >= 2) {
      const columnName = parts[parts.length - 1];
      const tableName = parts.slice(0, -1).join(".");
      return { tableName, columnName };
    }
    throw new Error(`Invalid relationship field format: ${field}`);
  }

  private createERNode(tableData: TableData, index: number, totalNodes: number): ERNode {
    const position = this.calculateNodePosition(index, totalNodes);
    return {
      id: tableData.table_name,
      type: "erNode",
      position,
      data: {
        label: tableData.name || tableData.table_name,
        tableName: tableData.table_name,
        comment: tableData.comment,
        columns: Object.values(tableData.schema),
        columnNames: Object.keys(tableData.schema),
        indexInfo: tableData.index_info,
      },
    };
  }

  private createRelationshipEdge(relationship: string[]): EREdge {
    const [sourceField, targetField] = relationship;
    const source = this.parseRelationshipField(sourceField);
    const target = this.parseRelationshipField(targetField);
    const relationshipType = getRelationshipType(source.columnName, target.columnName);

    return {
      id: `edge-${source.columnName}-${target.columnName}-${source.tableName}-${target.tableName}`,
      source: source.tableName,
      target: target.tableName,
      sourceHandle: source.columnName,
      targetHandle: target.columnName,
      label: relationshipType,
      type: "smoothstep",
      data: {
        relationshipType,
        sourceColumn: source.columnName,
        targetColumn: target.columnName,
      },
    };
  }

  generateERDiagram(): ERDiagramData {
    const tables = Array.from(this.tables.values());
    const nodes: ERNode[] = tables.map((table, index) =>
      this.createERNode(table, index, tables.length)
    );
    const edges: EREdge[] = this.relationships
      .map((relationship) => {
        try {
          return this.createRelationshipEdge(relationship);
        } catch (error) {
          console.error("Error creating relationship edge:", error);
          return null;
        }
      })
      .filter((e): e is EREdge => e !== null);

    return { nodes, edges };
  }

  clear(): void {
    this.tables.clear();
    this.relationships = [];
  }
}
