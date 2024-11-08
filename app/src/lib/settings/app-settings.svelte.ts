import { localState } from "$lib/helpers/localState.svelte";
import type { NodeInput } from "@nodes/types";

const themes = ["dark", "light", "catppuccin", "solarized", "high-contrast", "nord", "dracula"];

export const AppSettingTypes = {
  theme: {
    type: "select",
    options: themes,
    label: "Theme",
    value: themes[0],
  },
  showGrid: {
    type: "boolean",
    label: "Show Grid",
    value: true,
  },
  centerCamera: {
    type: "boolean",
    label: "Center Camera",
    value: true
  },
  nodeInterface: {
    title: "Node Interface",
    showNodeGrid: {
      type: "boolean",
      label: "Show Grid",
      value: true
    },
    snapToGrid: {
      type: "boolean",
      label: "Snap to Grid",
      value: true
    },
    showHelp: {
      type: "boolean",
      label: "Show Help",
      value: false
    }
  },
  debug: {
    wireframe: {
      type: "boolean",
      label: "Wireframe",
      value: false,
    },
    useWorker: {
      type: "boolean",
      label: "Execute runtime in worker",
      value: true,
    },
    showIndices: {
      type: "boolean",
      label: "Show Indices",
      value: false,
    },
    showPerformancePanel: {
      type: "boolean",
      label: "Show Performance Panel",
      value: false,
    },
    showBenchmarkPanel: {
      type: "boolean",
      label: "Show Benchmark Panel",
      value: false,
    },
    showVertices: {
      type: "boolean",
      label: "Show Vertices",
      value: false,
    },
    showStemLines: {
      type: "boolean",
      label: "Show Stem Lines",
      value: false,
    },
    stressTest: {
      title: "Stress Test",
      amount: {
        type: "integer",
        min: 2,
        max: 15
      },
      loadGrid: {
        type: "button",
        label: "Load Grid"
      },
      loadTree: {
        type: "button",
        label: "Load Tree"
      },
      lottaFaces: {
        type: "button",
        label: "Load 'lots of faces'"
      },
      lottaNodes: {
        type: "button",
        label: "Load 'lots of nodes'"
      },
      lottaNodesAndFaces: {
        type: "button",
        label: "Load 'lots of nodes and faces'"
      }
    },
  }
} as const

type IsInputDefinition<T> = T extends NodeInput ? T : never;
type HasTitle = { title: string };
type ExtractSettingsValues<T> = {
  [K in keyof T]: T[K] extends HasTitle
  ? ExtractSettingsValues<Omit<T[K], 'title'>>
  : T[K] extends IsInputDefinition<T[K]>
  ? T[K] extends { value: any }
  ? T[K]['value']
  : never
  : T[K] extends Record<string, any>
  ? ExtractSettingsValues<T[K]>
  : never;
};

function settingsToStore<T>(settings: T): ExtractSettingsValues<T> {
  const result = {} as any;
  for (const key in settings) {
    const value = settings[key];
    if (value && typeof value === 'object') {
      if ('value' in value) {
        result[key] = value.value;
      } else {
        result[key] = settingsToStore(value);
      }
    }
  }
  return result;
}

export const appSettings = localState("app-settings", settingsToStore(AppSettingTypes));

$effect.root(() => {
  $effect(() => {
    const { theme } = $state.snapshot(appSettings);
    const classes = document.body.parentElement?.classList;
    const newClassName = `theme-${theme}`;
    if (classes) {
      for (const className of classes) {
        if (className.startsWith("theme-") && className !== newClassName) {
          classes.remove(className);
        }
      }
    }
    document.body?.parentElement?.classList.add(newClassName);
  });
});
