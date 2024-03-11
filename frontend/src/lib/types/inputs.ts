type NodeInputFloat = {
  type: "float";
  value?: number;
  min?: number;
  max?: number;
}

type NodeInputInteger = {
  type: "integer";
  value?: number;
  min?: number;
  max?: number;
}

type NodeInputSelect = {
  type: "select";
  value?: string;
  options: string[];
}

type DefaultOptions = {
  internal?: boolean;
}

export type NodeInput = (NodeInputFloat | NodeInputInteger | NodeInputSelect) & DefaultOptions;
