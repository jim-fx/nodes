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
  options: string[];
  value?: number;
}

type NodeInputSeed = {
  type: "seed"
  value?: number;
}

type NodeInputVec3 = {
  type: "vec3";
  value?: number[];
}

type NodeInputModel = {
  type: "model";
}

type NodeInputPlant = {
  type: "plant"
}

type InputTypes = (NodeInputSeed | NodeInputBoolean | NodeInputFloat | NodeInputInteger | NodeInputSelect | NodeInputSeed | NodeInputVec3 | NodeInputModel | NodeInputPlant);

type InputId = InputTypes["type"];

type DefaultOptions = {
  internal?: boolean;
  external?: boolean;
  setting?: string;
  label?: string | false;
}

export type NodeInput = InputTypes & {
  type: InputId | InputId[];
} & DefaultOptions;


export type NodeInputType<T extends Record<string, NodeInput>> = {
  [K in keyof T]: T[K]["value"]
};
