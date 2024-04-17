import type { NodeInput } from "./inputs";
export type { NodeInput } from "./inputs";

export type Node = {
  id: number;
  type: string;
  props?: Record<string, any>,
  tmp?: {
    depth?: number;
    mesh?: any;
    parents?: Node[],
    children?: Node[],
    inputNodes?: Record<string, Node>
    type?: NodeType;
    downX?: number;
    downY?: number;
    x?: number;
    y?: number;
    ref?: HTMLElement;
    visible?: boolean;
    isMoving?: boolean;
  },
  meta?: {
    title?: string;
    lastModified?: string;
  },
  position: [x: number, y: number]
}

export type NodeType = {
  id: string;
  inputs?: Record<string, NodeInput>
  outputs?: string[];
  meta?: {
    title?: string;
  },
  execute?: (args: number[]) => unknown;
}

export type Socket = {
  node: Node;
  index: number | string;
  position: [number, number];
};


export interface NodeRegistry {
  /**
  * The status of the node registry
  * @remarks The status should be "loading" when the registry is loading, "ready" when the registry is ready, and "error" if an error occurred while loading the registry
  */
  status: "loading" | "ready" | "error";
  /**
   * Load the nodes with the given ids
  * @param nodeIds - The ids of the nodes to load
  * @returns A promise that resolves when the nodes are loaded
  * @throws An error if the nodes could not be loaded
  * @remarks This method should be called before calling getNode or getAllNodes
  */
  load: (nodeIds: string[]) => Promise<void>;
  /**
   * Get a node by id
   * @param id - The id of the node to get
   * @returns The node with the given id, or undefined if no such node exists
   */
  getNode: (id: string) => NodeType | undefined;
  /**
   * Get all nodes
   * @returns An array of all nodes
   */
  getAllNodes: () => NodeType[];
}

export interface RuntimeExecutor {
  /**
  * Execute the given graph
  * @param graph - The graph to execute
  * @returns The result of the execution
  */
  execute: (graph: Graph) => unknown;
}


export type Edge = [Node, number, Node, string];

export type Graph = {
  id: number;
  meta?: {
    title?: string;
    lastModified?: string;
  },
  settings?: Record<string, any>,
  nodes: Node[];
  edges: [number, number, number, string][];
}
