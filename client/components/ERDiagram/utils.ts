import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";
import { DEFAULT_VISIBLE_ROWS } from "./constant";

export const getRelationshipType = (
  sourceColumn: string,
  targetColumn: string
): string => {
  if (
    sourceColumn.toLowerCase().includes("id") &&
    targetColumn.toLowerCase().includes("id")
  ) {
    return "1:1";
  }
  return "1:N";
};

// ── 节点高度估算常量（与 ERNode.less 中实际样式对齐）──
const NODE_HEADER_H = 52;   // 表头（标题 + 注释行）
const COL_HEADER_H = 28;    // 列表头行
const ROW_H = 36;           // 每行数据行高
const EXPAND_BTN_H = 36;    // 展开/收起按钮区域高度
const NODE_WIDTH = 380;     // 节点宽度（与 ERNode.less min-width 一致）
const H_GAP = 100;          // 节点间水平间距
const V_GAP = 80;           // 节点间垂直间距

/**
 * 估算单个节点的实际渲染高度
 */
function estimateNodeHeight(
  node: Node,
  expandNodes: Record<string, boolean>
): number {
  const colCount =
    (node.data?.columnNames as string[] | undefined)?.length ?? 0;
  const isExpanded = expandNodes[node.id] ?? false;

  if (isExpanded) {
    return NODE_HEADER_H + COL_HEADER_H + colCount * ROW_H;
  }
  const visibleRows = Math.min(colCount, DEFAULT_VISIBLE_ROWS);
  const hasExpandBtn = colCount > DEFAULT_VISIBLE_ROWS;
  return (
    NODE_HEADER_H +
    COL_HEADER_H +
    visibleRows * ROW_H +
    (hasExpandBtn ? EXPAND_BTN_H : 0)
  );
}

/**
 * 判断是否应使用网格布局（超过一半节点无连线时回退到网格）
 */
function shouldUseGridLayout(nodes: Node[], edges: Edge[]): boolean {
  if (edges.length === 0) return true;
  const connected = new Set<string>();
  edges.forEach((e) => {
    connected.add(e.source);
    connected.add(e.target);
  });
  return nodes.length - connected.size > nodes.length / 2;
}

/**
 * Dagre 有向图布局（有连线时使用）
 */
function getDagreLayoutElements(
  nodes: Node[],
  edges: Edge[],
  expandNodes: Record<string, boolean>
): { nodes: Node[]; edges: Edge[] } {
  // 预先计算每个节点的实际高度
  const heightMap = new Map<string, number>();
  nodes.forEach((n) => heightMap.set(n.id, estimateNodeHeight(n, expandNodes)));

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: "LR",      // 从左到右排列 rank（每列是一个 rank）
    ranksep: H_GAP * 2, // rank 之间（水平方向）的间距
    nodesep: V_GAP,     // 同 rank 内节点（垂直方向）的间距
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((n) => {
    g.setNode(n.id, { width: NODE_WIDTH, height: heightMap.get(n.id)! });
  });

  // 过滤掉自环，dagre 对自环处理不稳定
  edges.forEach((e) => {
    if (e.source !== e.target) g.setEdge(e.source, e.target);
  });

  dagre.layout(g);

  // dagre 返回的是节点中心坐标，React Flow 需要左上角坐标
  const layoutedNodes = nodes.map((n) => {
    const { x, y } = g.node(n.id);
    const h = heightMap.get(n.id)!;
    return {
      ...n,
      position: {
        x: x - NODE_WIDTH / 2,
        y: y - h / 2,
      },
    };
  });

  // dagre 已保证无重叠，做一次最终安全检查即可
  return {
    nodes: resolveOverlaps(layoutedNodes, heightMap, H_GAP, V_GAP),
    edges,
  };
}

/**
 * 网格布局（无连线或大量孤立节点时使用）
 * 按列数分组，每行使用该行最高节点高度作为行间距，保证不重叠
 */
function getGridLayoutElements(
  nodes: Node[],
  edges: Edge[],
  expandNodes: Record<string, boolean>
): { nodes: Node[]; edges: Edge[] } {
  if (nodes.length === 0) return { nodes, edges };

  // 预先计算所有节点高度
  const heightMap = new Map<string, number>();
  nodes.forEach((n) => heightMap.set(n.id, estimateNodeHeight(n, expandNodes)));

  const cols = Math.max(1, Math.ceil(Math.sqrt(nodes.length * 1.4)));
  const colSpacing = NODE_WIDTH + H_GAP;

  // 按行分组，计算每行最大高度 → 每行的 y 起始位置
  const rowCount = Math.ceil(nodes.length / cols);
  const rowMaxHeight: number[] = Array(rowCount).fill(0);
  nodes.forEach((n, idx) => {
    const row = Math.floor(idx / cols);
    rowMaxHeight[row] = Math.max(rowMaxHeight[row], heightMap.get(n.id)!);
  });

  // 累加 y 偏移
  const rowStartY: number[] = [40];
  for (let r = 1; r < rowCount; r++) {
    rowStartY[r] = rowStartY[r - 1] + rowMaxHeight[r - 1] + V_GAP;
  }

  const startX = 40;

  const layoutedNodes = nodes.map((n, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    return {
      ...n,
      position: {
        x: startX + col * colSpacing,
        y: rowStartY[row],
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

/**
 * 最终安全兜底：检测并消除重叠
 * 使用左上角坐标系（React Flow 的坐标体系）
 */
function resolveOverlaps(
  nodes: Node[],
  heightMap: Map<string, number>,
  hGap: number,
  vGap: number
): Node[] {
  const result = nodes.map((n) => ({ ...n }));

  for (let i = 1; i < result.length; i++) {
    let cur = result[i];
    let changed = true;

    while (changed) {
      changed = false;
      for (let j = 0; j < i; j++) {
        const other = result[j];
        const curH = heightMap.get(cur.id) ?? NODE_HEADER_H + COL_HEADER_H + DEFAULT_VISIBLE_ROWS * ROW_H;
        const otherH = heightMap.get(other.id) ?? curH;

        // 左上角坐标系下的重叠检测
        const hOverlap =
          cur.position.x < other.position.x + NODE_WIDTH + hGap &&
          other.position.x < cur.position.x + NODE_WIDTH + hGap;
        const vOverlap =
          cur.position.y < other.position.y + otherH + vGap &&
          other.position.y < cur.position.y + curH + vGap;

        if (hOverlap && vOverlap) {
          // 向右移动，避免重叠
          cur = {
            ...cur,
            position: {
              x: other.position.x + NODE_WIDTH + hGap,
              y: cur.position.y,
            },
          };
          result[i] = cur;
          changed = true;
          break;
        }
      }
    }
  }

  return result;
}

/**
 * 主入口：根据有无连线自动选择布局策略
 */
export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options?: {
    expandNodes?: Record<string, boolean>;
  }
): { nodes: Node[]; edges: Edge[] } => {
  const expandNodes = options?.expandNodes ?? {};

  if (shouldUseGridLayout(nodes, edges)) {
    return getGridLayoutElements(nodes, edges, expandNodes);
  }
  return getDagreLayoutElements(nodes, edges, expandNodes);
};
