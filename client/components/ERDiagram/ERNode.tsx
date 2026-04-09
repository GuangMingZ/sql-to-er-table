import { Tag, Tooltip } from "antd";
import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
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

// 折叠状态下滚动区域的最大高度（列表头 + DEFAULT_VISIBLE_ROWS 行）
const COLLAPSED_MAX_HEIGHT = 28 + DEFAULT_VISIBLE_ROWS * 36; // px

export const ERNode = memo(({ data }: NodeProps<ERNodeData>) => {
  const { label, tableName, comment, columns, columnNames, indexInfo } =
    data as unknown as ERNodeData;

  const { triggerRelayout } = useERDiagramContext();
  const nodeRef = useRef<HTMLDivElement>(null);
  const scrollBodyRef = useRef<HTMLDivElement>(null);
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
    };
  });

  const needsExpansion = tableData.length > DEFAULT_VISIBLE_ROWS;

  // wheel 事件处理：bubble 阶段拦截，避免 capture 阶段阻止 native scroll
  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const handleWheel = (e: WheelEvent) => {
      // capture 阶段拦截，始终阻止事件到达 ReactFlow，防止画布缩放/平移
      e.stopPropagation();
      e.preventDefault();

      // 折叠态下：手动驱动滚动容器（capture 阻断了 native scroll，需手动处理）
      const scrollEl = scrollBodyRef.current;
      if (!isExpanded && scrollEl) {
        // deltaMode: 0=px(触摸板), 1=行, 2=页
        let delta = e.deltaY;
        if (e.deltaMode === 1) delta *= 20;
        else if (e.deltaMode === 2) delta *= scrollEl.clientHeight;
        scrollEl.scrollTop += delta;
      }
    };

    // capture: true — 在 ReactFlow pane 的 bubble 监听器之前触发
    // passive: false — 允许调用 preventDefault()
    node.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    return () => node.removeEventListener("wheel", handleWheel, { capture: true });
  }, [isExpanded]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      setTimeout(() => triggerRelayout(tableName, next), 50);
      return next;
    });
  }, [tableName, triggerRelayout]);

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
        {/* 折叠时：固定高度可滚动容器；展开时：不限高度 */}
        <div
          ref={scrollBodyRef}
          className={`er-node__scroll-body${isExpanded ? " er-node__scroll-body--expanded" : ""}`}
          style={isExpanded ? undefined : { maxHeight: COLLAPSED_MAX_HEIGHT }}
        >
          <table className="er-node__table">
            <thead>
              <tr>
                <th className="er-node__th er-node__th--name">字段名</th>
                <th className="er-node__th er-node__th--type">类型</th>
                <th className="er-node__th er-node__th--nullable">可空</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
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
        </div>

        {/* 展开/收起按钮 */}
        {needsExpansion && (
          <div className="er-node__expand-ctrl">
            <button className="er-node__expand-btn" onClick={toggleExpanded}>
              {isExpanded ? "收起" : `展开全部 (${tableData.length} 行)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

ERNode.displayName = "ERNode";
