import localStore from "$lib/helpers/localStore";

export const AppSettings = localStore("node.settings", {
  theme: 0,
  showGrid: true,
  showNodeGrid: true,
  snapToGrid: true,
  showHelp: false,
  wireframe: false,
  showIndices: false,
  showVertices: false,
  showPerformancePanel: false,
  showBenchmarkPanel: false,
  centerCamera: true,
  showStemLines: false,
  useWorker: true,
  amount: 5
});

const themes = ["dark", "light", "catppuccin", "solarized", "high-contrast", "nord", "dracula"];

AppSettings.subscribe((value) => {
  const classes = document.body.classList;
  const newClassName = `theme-${themes[value.theme]}`;
  for (const className of classes) {
    if (className.startsWith("theme-") && className !== newClassName) {
      classes.remove(className);
    }
  }
  document.body.classList.add(newClassName);
});

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
    __title: "Node Interface",
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
      __title: "Stress Test",
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
}

