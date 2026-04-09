import { createContext, useContext } from "react";
import { EREdge } from "./types";

interface IERDiagramContext {
  triggerRelayout: (nodeId: string, expanded: boolean) => void;
  addEdgeFunc?: (params: Omit<EREdge, "id" | "type">) => Promise<boolean>;
}

export const ERDiagramContext = createContext<IERDiagramContext>({
  triggerRelayout: () => {},
});

export const useERDiagramContext = () => useContext(ERDiagramContext);
