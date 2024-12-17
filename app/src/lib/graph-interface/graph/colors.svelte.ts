import { appSettings } from "$lib/settings/app-settings.svelte";
import { Color } from "three";

const variables = [
  "layer-0",
  "layer-1",
  "layer-2",
  "layer-3",
  "outline",
  "active",
  "selected",
  "edge",
] as const;

function getColor(variable: typeof variables[number]) {
  const style = getComputedStyle(document.body.parentElement!);
  let color = style.getPropertyValue(`--${variable}`);
  return new Color().setStyle(color);
}

export const colors = Object.fromEntries(variables.map(v => [v, getColor(v)])) as Record<typeof variables[number], Color>;

$effect.root(() => {
  $effect(() => {
    if (!appSettings.theme || !("getComputedStyle" in globalThis)) return;
    const style = getComputedStyle(document.body.parentElement!);
    for (const v of variables) {
      colors[v].setStyle(style.getPropertyValue(`--${v}`));
    }
  });
})
