import { z } from "zod";
import { NodeInputSchema } from "./inputs";

export const NodeTypeSchema = z
  .string()
  .regex(/^[^/]+\/[^/]+\/[^/]+$/, "Invalid NodeId format")
  .transform((value) => value as `${string}/${string}/${string}`);

export type NodeType = z.infer<typeof NodeTypeSchema>;

export const NodeSchema = z.object({
  id: z.number(),
  type: NodeTypeSchema,
  tmp: z.any().optional(),
  props: z
    .record(z.string(), z.union([z.number(), z.array(z.number())]))
    .optional(),
  meta: z
    .object({
      title: z.string().optional(),
      lastModified: z.string().optional(),
    })
    .optional(),
  position: z.tuple([z.number(), z.number()]),
});

export type Node = {
  tmp?: {
    depth?: number;
    mesh?: any;
    random?: number;
    parents?: Node[];
    children?: Node[];
    inputNodes?: Record<string, Node>;
    type?: NodeDefinition;
    downX?: number;
    downY?: number;
    x?: number;
    y?: number;
    ref?: HTMLElement;
    visible?: boolean;
    isMoving?: boolean;
  };
} & z.infer<typeof NodeSchema>;

export const NodeDefinitionSchema = z.object({
  id: NodeTypeSchema,
  inputs: z.record(z.string(), NodeInputSchema).optional(),
  outputs: z.array(z.string()).optional(),
  meta: z
    .object({
      description: z.string().optional(),
      title: z.string().optional(),
    })
    .optional(),
});

export type NodeDefinition = z.infer<typeof NodeDefinitionSchema> & {
  execute(input: Int32Array): Int32Array;
};

export type Socket = {
  node: Node;
  index: number | string;
  position: [number, number];
};

export type Edge = [Node, number, Node, string];

export const GraphSchema = z.object({
  id: z.number(),
  meta: z
    .object({
      title: z.string().optional(),
      lastModified: z.string().optional(),
    })
    .optional(),
  settings: z.record(z.string(), z.any()).optional(),
  nodes: z.array(NodeSchema),
  edges: z.array(z.tuple([z.number(), z.number(), z.number(), z.string()])),
});

export type Graph = z.infer<typeof GraphSchema> & { nodes: Node[] };
