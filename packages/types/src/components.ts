import { Graph, NodeDefinition, NodeId } from "./types";

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
  load: (nodeIds: NodeId[]) => Promise<NodeDefinition[]>;
  /**
   * Get a node by id
   * @param id - The id of the node to get
   * @returns The node with the given id, or undefined if no such node exists
   */
  getNode: (id: NodeId) => NodeDefinition | undefined;
  /**
   * Get all nodes
   * @returns An array of all nodes
   */
  getAllNodes: () => NodeDefinition[];
}

export interface RuntimeExecutor {
  /**
  * Execute the given graph
  * @param graph - The graph to execute
  * @returns The result of the execution
  */
  execute: (graph: Graph, settings: Record<string, unknown>) => unknown;
}

export interface RuntimeCache {
  /**
   * Get the value for the given key
   * @param key - The key to get the value for
   * @returns The value for the given key, or undefined if no such value exists
   */
  get: (key: string) => unknown | undefined;
  /**
   * Set the value for the given key
   * @param key - The key to set the value for
   * @param value - The value to set
   */
  set: (key: string, value: unknown) => void;
  /**
   * Clear the cache
   */
  clear: () => void;

}
