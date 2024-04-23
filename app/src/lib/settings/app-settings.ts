import localStore from "$lib/helpers/localStore";

export const AppSettings = localStore("node-settings", {
  theme: 0,
  showGrid: true,
  showNodeGrid: true,
  snapToGrid: true,
  wireframes: false,
  showIndices: false,
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
    }
  },
  debug: {
    wireframe: {
      type: "boolean",
      label: "Wireframe",
      value: false,
    },
    showIndices: {
      type: "boolean",
      label: "Show Indices",
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
    },
  }
}

