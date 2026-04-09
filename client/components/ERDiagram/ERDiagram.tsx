import { Card, Spin } from "antd";
import {
  addEdge,
  Background,
  Connection,
  ConnectionMode,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  forwardRef,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import "./ERDiagram.less";
import { ERDiagramContext } from "./ERDiagramContext";
import { ERDiagramParser } from "./ERDiagramParser";
import { ERNode } from "./ERNode";
import { EREdge, RelationshipData, TableData } from "./types";
import { getLayoutedElements } from "./utils";

const nodeTypes: NodeTypes = {
  erNode: ERNode,
};

interface ERDiagramProps {
  initialData?: {
    tables: TableData[];
    relationships: RelationshipData;
  };
}

export interface ERDiagramRef {
  addEdgeFunc: (params: Omit<EREdge, "id" | "type">) => Promise<boolean>;
  deleteEdgeByNodeId: (nodeId: string) => Promise<boolean>;
}

/**
 * ER 图主组件
 */
export const ERDiagram = forwardRef<ERDiagramRef, ERDiagramProps>(
  ({ initialData }, ref: Ref<ERDiagramRef>) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [parser] = useState(() => new ERDiagramParser());
    const [loading, setLoading] = useState(false);
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

    useEffect(() => {
      generateDiagram();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]);

    // 展开节点变化时重新布局
    useEffect(() => {
      if (Object.keys(expandedNodes).length > 0 && nodes.length > 0) {
        const { nodes: layoutedNodes, edges: layoutedEdges } =
          getLayoutedElements(nodes, edges, {
            expandNodes: { ...expandedNodes },
          });
        setNodes(layoutedNodes as any);
        setEdges(layoutedEdges as any);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expandedNodes]);

    const onConnect = useCallback(
      (params: Connection) => setEdges((eds) => addEdge(params, eds)),
      [setEdges]
    );

    const generateDiagram = useCallback(async () => {
      if (!initialData) return;

      setLoading(true);
      try {
        parser.clear();
        parser.addTables(initialData.tables);
        parser.setRelationships(initialData.relationships);

        const { nodes: generatedNodes, edges: generatedEdges } =
          parser.generateERDiagram();
        const { nodes: layoutedNodes, edges: layoutedEdges } =
          getLayoutedElements(generatedNodes, generatedEdges, {
            expandNodes: expandedNodes,
          });

        setNodes(layoutedNodes as any);
        setEdges(layoutedEdges as any);
      } catch (error) {
        console.error("生成 ER 图失败:", error);
      } finally {
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData, parser, setNodes, setEdges]);

    const nodeColor = useCallback(() => "#1677ff", []);

    const addEdgeFunc = useCallback(
      async (params: Omit<EREdge, "id" | "type">): Promise<boolean> => {
        const { source, target, sourceHandle, targetHandle, label, data } = params;
        const newEdge: EREdge = {
          id: `edge-${Date.now()}-${source}-${target}`,
          source,
          target,
          sourceHandle,
          targetHandle,
          label: label || data?.relationshipType || "",
          type: "smoothstep",
          data,
        };
        setEdges((currentEdges: EREdge[]) => [...currentEdges, newEdge] as any);
        return true;
      },
      [setEdges]
    );

    const deleteEdgeByNodeId = useCallback(
      async (nodeId: string): Promise<boolean> => {
        setEdges(
          (currentEdges: EREdge[]) =>
            currentEdges.filter(
              (edge: any) => edge.source !== nodeId && edge.target !== nodeId
            ) as any
        );
        return true;
      },
      [setEdges]
    );

    useImperativeHandle(
      ref,
      () => ({ addEdgeFunc, deleteEdgeByNodeId }),
      [addEdgeFunc, deleteEdgeByNodeId]
    );

    const triggerRelayout = useCallback((nodeId: string, expanded: boolean) => {
      setExpandedNodes((prev) => ({ ...prev, [nodeId]: expanded }));
    }, []);

    if (loading) {
      return (
        <div className="er-diagram-loading">
          <Spin size="large" tip="生成 ER 图中..." />
        </div>
      );
    }

    return (
      <ERDiagramContext.Provider value={{ triggerRelayout, addEdgeFunc }}>
        <div className="er-diagram-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            proOptions={{ hideAttribution: true }}
            zoomOnScroll={true}
            zoomOnPinch={true}
            zoomOnDoubleClick={true}
            panOnScroll={false}
          >
            <Background />
            <Controls />
            <MiniMap nodeColor={nodeColor} />
            <Panel position="top-right">
              <Card size="small" className="er-diagram-info">
                <div className="er-diagram-info__item">
                  表数量：<strong>{nodes.length}</strong>
                </div>
                <div className="er-diagram-info__item">
                  关系数量：<strong>{edges.length}</strong>
                </div>
              </Card>
            </Panel>
          </ReactFlow>
        </div>
      </ERDiagramContext.Provider>
    );
  }
);

ERDiagram.displayName = "ERDiagram";
