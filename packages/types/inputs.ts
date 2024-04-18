type NodeInputFloat = {
  type: "float";
  element?: "slider";
  value?: number;
  min?: number;
  max?: number;
  step?: number;
}

type NodeInputInteger = {
  type: "integer";
  element?: "slider";
  value?: number;
  min?: number;
  max?: number;
}

type NodeInputBoolean = {
  type: "boolean";
  value?: boolean;
}

type NodeInputSelect = {
  type: "select";
  labels: string[];
  value?: number;
}

type NodeInputSeed = {
  type: "seed"
  value?: number;
}

type DefaultOptions = {
  internal?: boolean;
  external?: boolean;
  setting?: string;
  label?: string;
}

type InputTypes = (NodeInputSeed | NodeInputBoolean | NodeInputFloat | NodeInputInteger | NodeInputSelect);

export type NodeInput = InputTypes & {
  type: InputTypes["type"] | InputTypes["type"][];
} & DefaultOptions;


export type NodeInputType<T extends Record<string, NodeInput>> = {
  [K in keyof T]: T[K]["value"]
};
