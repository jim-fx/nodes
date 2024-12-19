import type { NodeInput } from "@nodes/types";

type Button = { type: "button"; label?: string };

type InputType = NodeInput | Button;

export interface SettingsType {
  [key: string]: (SettingsType & { title?: string }) | InputType;
}

export type SettingsStore = {
  [key: string]: SettingsStore | string | number | boolean
};
