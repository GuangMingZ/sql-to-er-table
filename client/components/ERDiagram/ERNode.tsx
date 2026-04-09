import { Tag, Tooltip } from "antd";
import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_VISIBLE_ROWS } from "./constant";
import { useERDiagramContext } from "./ERDiagramContext";
import "./ERNode.less";
import type { TableColumn } from "./types";

interface ERNodeData extends Node {
  label: string;
  tableName: string;
  comment: string | null;
  columns: TableColumn[];
  columnNames: string[];
  indexInfo?: {
    primary_key?: string[];
  };
}

export const ERNode = memo(({ data }: NodeProps<ERNodeData>) => {
  const { label, tableName, comment, columns, columnNames, indexInfo } =
    data as unknown as ERNodeData;

  const { triggerRelayout } = useERDiagramContext();
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const tableData = columnNames.map((columnName, index) => {
    const column = columns[index];
    const isPrimaryKey = indexInfo?.primary_key?.includes(columnName) ?? false;
    return {
      key: columnName,
      columnName,
      type: column?.type ?? "",
      nullable: column?.nullable ?? true,
      comment: column?.comment ?? "",
      isPrimaryKey,
      show: false,
    };
  });

  const displayedTableData = tableData.map((row, idx) => ({
    ...row,
    show: isExpanded || idx < DEFAULT_VISIBLE_ROWS,
  }));

  const needsExpansion = tableData.length > DEFAULT_VISIBLE_ROWS;

  useEffect(() => {
    if (!nodeRef.current) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    nodeRef.current.addEventListener("wheel", handleNativeWheel, {
      passive: false,
      capture: true,
    });

    const resizeObserver = new ResizeObserver(() => {});
    resizeObserver.observe(nodeRef.current);

    const currentRef = nodeRef.current;
    return () => {
      resizeObserver.disconnect();
      currentRef.removeEventListener("wheel", handleNativeWheel, { capture: true });
    };
  }, [isExpanded, displayedTableData.length]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      setTimeout(() => triggerRelayout(tableName, next), 50);
      return next;
    });
  }, [tableName, triggerRelayout]);

  const hiddenRows = isExpanded ? [] : tableData.slice(DEFAULT_VISIBLE_ROWS);

  return (
    <div className="er-node" ref={nodeRef}>
      {/* 表头 */}
      <div className="er-node__header">
        <div className="er-node__header-title">
          <span className="er-node__table-name">{label || tableName}</span>
          {comment && (
            <Tooltip title={comment}>
              <span className="er-node__table-comment">{comment}</span>
            </Tooltip>
          )}
        </div>
        <div className="er-node__meta">
          <span className="er-node__col-count">{columnNames.length} 列</span>
        </div>
      </div>

      {/* 表格 */}
      <div className="er-node__body">
        <table className="er-node__table">
          <thead>
            <tr>
              <th className="er-node__th er-node__th--name">字段名</th>
              <th className="er-node__th er-node__th--type">类型</th>
              <th className="er-node__th er-node__th--nullable">可空</th>
            </tr>
          </thead>
          <tbody>
            {displayedTableData
              .filter((row) => row.show)
              .map((row) => (
                <tr key={row.columnName} className="er-node__tr">
                  <td className="er-node__td er-node__td--name">
                    <Handle
                      type="target"
                      position={Position.Left}
                      id={row.columnName}
                      className="column-handle column-handle--left"
                    />
                    <span className="er-node__col-name">{row.columnName}</span>
                    {row.isPrimaryKey && (
                      <Tag color="blue" className="er-node__pk-tag">PK</Tag>
                    )}
                    {row.comment && (
                      <Tooltip title={row.comment}>
                        <span className="er-node__col-comment">{row.comment}</span>
                      </Tooltip>
                    )}
                  </td>
                  <td className="er-node__td er-node__td--type">
                    <span className="er-node__col-type">{row.type}</span>
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={row.columnName}
                      className="column-handle column-handle--right"
                    />
                  </td>
                  <td className="er-node__td er-node__td--nullable">
                    <Tag
                      color={row.nullable ? "default" : "error"}
                      className="er-node__nullable-tag"
                    >
                      {row.nullable ? "YES" : "NO"}
                    </Tag>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* 隐藏行的虚拟 Handle（收起时保持连线可用） */}
        {!isExpanded && hiddenRows.length > 0 && (
          <div className="er-node__hidden-handles">
            {hiddenRows.map((row) => (
              <React.Fragment key={row.columnName}>
                <Handle
                  type="target"
                  position={Position.Left}
                  id={row.columnName}
                  className="column-handle column-handle--hidden"
                />
                <Handle
                  type="source"
                  position={Position.Right}
                  id={row.columnName}
                  className="column-handle column-handle--hidden"
                />
              </React.Fragment>
            ))}
          </div>
        )}

        {/* 展开/收起按钮 */}
        {needsExpansion && (
          <div className="er-node__expand-ctrl">
            <button className="er-node__expand-btn" onClick={toggleExpanded}>
              {isExpanded
                ? "收起"
                : `展开 (${tableData.length - DEFAULT_VISIBLE_ROWS} 行)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

ERNode.displayName = "ERNode";
