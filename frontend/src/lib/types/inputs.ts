type NodeInputFloat = {
  type: "float";
  value?: number;
  min?: number;
  max?: number;
  step?: number;
}

type NodeInputInteger = {
  type: "integer";
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
  value?: string;
  options: string[];
}

type DefaultOptions = {
  internal?: boolean;
}

export type NodeInput = (NodeInputBoolean | NodeInputFloat | NodeInputInteger | NodeInputSelect) & DefaultOptions;
