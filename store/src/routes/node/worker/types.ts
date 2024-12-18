import { NodeDefinition } from "../schemas/types.ts";

type ExtractDefinitionMessage = {
  action: "extract-definition";
  content: ArrayBuffer;
};

type ErrorMessage = {
  action: "error";
  error: Error;
};

type ResultMessage = {
  action: "result";
  result: NodeDefinition;
};

export type WorkerMessage =
  | ErrorMessage
  | ResultMessage
  | ExtractDefinitionMessage;
