import { z } from "zod";
import { NodeInputSchema } from "./inputs.ts";

export type NodeId = `${string}/${string}/${string}`;

export const idRegex = /[a-z0-9-]+/i;

const idSchema = z
  .string()
  .regex(
    new RegExp(
      `^(${idRegex.source})/(${idRegex.source})/(${idRegex.source})$`,
    ),
    "Invalid id format",
  );

export const NodeDefinitionSchema = z
  .object({
    id: idSchema,
    inputs: z.record(NodeInputSchema).optional(),
    outputs: z.array(z.string()).optional(),
    meta: z
      .object({
        description: z.string().optional(),
        title: z.string().optional(),
      })
      .optional(),
  })
  .openapi("NodeDefinition");

export type NodeDefinition = z.infer<typeof NodeDefinitionSchema>;
