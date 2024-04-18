import localStore from "$lib/helpers/localStore";

export const AppSettings = localStore("node-settings", {
  theme: 0,
  showGrid: true,
  wireframes: false,
  showIndices: false,
});

AppSettings.subscribe((value) => {
  if (value.theme === 0) {
    document.body.classList.remove("theme-catppuccin");
  } else {
    document.body.classList.add("theme-catppuccin");
  }
});

export const AppSettingTypes = {
  theme: {
    type: "select",
    options: ["dark", "cat"],
    value: "dark",
  },
  showGrid: {
    type: "boolean",
    value: true,
  },
  wireframe: {
    type: "boolean",
    value: false,
  },
  showIndices: {
    type: "boolean",
    value: false,
  },
}

