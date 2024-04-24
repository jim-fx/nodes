const __vite__fileDeps=["assets/HomeView.vue-CcWnFK65.js","assets/story--eZPzd9h.js","assets/vendor-BCKkA27H.js","assets/StoryView.vue-BFx-CBXY.js","assets/MobileOverlay.vue2-BRmV4xb2.js","assets/BaseEmpty.vue-C0i8tRal.js","assets/state-BFrY_pEm.js"],__vite__mapDeps=i=>i.map(i=>__vite__fileDeps[i]);
import { S as SvelteComponentDev, Q as init, R as safe_not_equal, U as dispatch_dev, V as validate_slots, W as element, X as space, Y as svg_element, Z as claim_element, _ as claim_space, $ as children, a0 as claim_svg_element, a1 as detach_dev, a2 as attr_dev, a3 as add_location, a4 as insert_hydration_dev, a5 as append_hydration_dev, a6 as listen_dev, a7 as noop, a8 as create_component, a9 as claim_component, aa as mount_component, ab as transition_in, ac as transition_out, ad as destroy_component, ae as createEventDispatcher, af as toggle_class, ag as set_input_value, ah as to_number, ai as run_all, aj as binding_callbacks, ak as flush, al as get_svelte_dataset, am as ensure_array_like_dev, an as add_render_callback, ao as select_option, ap as destroy_each, aq as select_value, ar as text, as as claim_text, at as set_data_dev, au as Logo_square, av as Logo_dark, aw as createRouter, ax as createWebHistory, ay as createWebHashHistory, az as useDark, aA as useToggle, k as watch, aB as markRaw, E as reactive, d as defineComponent, r as ref, aC as watchEffect, o as openBlock, q as createBlock, aD as mergeProps, aE as resolveDynamicComponent, h as createCommentVNode } from "./vendor-BCKkA27H.js";
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    const links = document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
    const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
    promise = Promise.all(deps.map((dep) => {
      dep = assetsURL(dep);
      if (dep in seen)
        return;
      seen[dep] = true;
      const isCss = dep.endsWith(".css");
      const cssSelector = isCss ? '[rel="stylesheet"]' : "";
      const isBaseRelative = !!importerUrl;
      if (isBaseRelative) {
        for (let i = links.length - 1; i >= 0; i--) {
          const link2 = links[i];
          if (link2.href === dep && (!isCss || link2.rel === "stylesheet")) {
            return;
          }
        }
      } else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
        return;
      }
      const link = document.createElement("link");
      link.rel = isCss ? "stylesheet" : scriptRel;
      if (!isCss) {
        link.as = "script";
        link.crossOrigin = "";
      }
      link.href = dep;
      if (cspNonce) {
        link.setAttribute("nonce", cspNonce);
      }
      document.head.appendChild(link);
      if (isCss) {
        return new Promise((res, rej) => {
          link.addEventListener("load", res);
          link.addEventListener("error", () => rej(new Error(`Unable to preload CSS for ${dep}`)));
        });
      }
    }));
  }
  return promise.then(() => baseModule()).catch((err) => {
    const e = new Event("vite:preloadError", { cancelable: true });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  });
};
const file$8 = "src/lib/elements/Checkbox.svelte";
function create_fragment$8(ctx) {
  let input;
  let t;
  let label;
  let svg;
  let path;
  let mounted;
  let dispose;
  const block = {
    c: function create() {
      input = element("input");
      t = space();
      label = element("label");
      svg = svg_element("svg");
      path = svg_element("path");
      this.h();
    },
    l: function claim(nodes) {
      input = claim_element(nodes, "INPUT", { id: true, type: true, class: true });
      t = claim_space(nodes);
      label = claim_element(nodes, "LABEL", { for: true, class: true });
      var label_nodes = children(label);
      svg = claim_svg_element(label_nodes, "svg", {
        viewBox: true,
        fill: true,
        xmlns: true,
        class: true
      });
      var svg_nodes = children(svg);
      path = claim_svg_element(svg_nodes, "path", {
        d: true,
        stroke: true,
        "stroke-width": true,
        "stroke-linecap": true,
        "stroke-linejoin": true
      });
      children(path).forEach(detach_dev);
      svg_nodes.forEach(detach_dev);
      label_nodes.forEach(detach_dev);
      this.h();
    },
    h: function hydrate() {
      attr_dev(
        input,
        "id",
        /*id*/
        ctx[1]
      );
      attr_dev(input, "type", "checkbox");
      attr_dev(input, "class", "s-TUFw0ou_zJq2");
      add_location(input, file$8, 12, 0, 201);
      attr_dev(path, "d", "M2 7L7 12L17 2");
      attr_dev(path, "stroke", "currentColor");
      attr_dev(path, "stroke-width", "3");
      attr_dev(path, "stroke-linecap", "round");
      attr_dev(path, "stroke-linejoin", "round");
      add_location(path, file$8, 15, 4, 349);
      attr_dev(svg, "viewBox", "0 0 19 14");
      attr_dev(svg, "fill", "none");
      attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
      attr_dev(svg, "class", "s-TUFw0ou_zJq2");
      add_location(svg, file$8, 14, 2, 272);
      attr_dev(
        label,
        "for",
        /*id*/
        ctx[1]
      );
      attr_dev(label, "class", "s-TUFw0ou_zJq2");
      add_location(label, file$8, 13, 0, 253);
    },
    m: function mount(target, anchor) {
      insert_hydration_dev(target, input, anchor);
      input.checked = /*value*/
      ctx[0];
      insert_hydration_dev(target, t, anchor);
      insert_hydration_dev(target, label, anchor);
      append_hydration_dev(label, svg);
      append_hydration_dev(svg, path);
      if (!mounted) {
        dispose = listen_dev(
          input,
          "change",
          /*input_change_handler*/
          ctx[2]
        );
        mounted = true;
      }
    },
    p: function update(ctx2, [dirty]) {
      if (dirty & /*id*/
      2) {
        attr_dev(
          input,
          "id",
          /*id*/
          ctx2[1]
        );
      }
      if (dirty & /*value*/
      1) {
        input.checked = /*value*/
        ctx2[0];
      }
      if (dirty & /*id*/
      2) {
        attr_dev(
          label,
          "for",
          /*id*/
          ctx2[1]
        );
      }
    },
    i: noop,
    o: noop,
    d: function destroy(detaching) {
      if (detaching) {
        detach_dev(input);
        detach_dev(t);
        detach_dev(label);
      }
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment$8.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance$8($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Checkbox", slots, []);
  let { value } = $$props;
  let { id } = $$props;
  $$self.$$.on_mount.push(function() {
    if (value === void 0 && !("value" in $$props || $$self.$$.bound[$$self.$$.props["value"]])) {
      console.warn("<Checkbox> was created without expected prop 'value'");
    }
    if (id === void 0 && !("id" in $$props || $$self.$$.bound[$$self.$$.props["id"]])) {
      console.warn("<Checkbox> was created without expected prop 'id'");
    }
  });
  const writable_props = ["value", "id"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Checkbox> was created with unknown prop '${key}'`);
  });
  function input_change_handler() {
    value = this.checked;
    $$invalidate(0, value);
  }
  $$self.$$set = ($$props2) => {
    if ("value" in $$props2)
      $$invalidate(0, value = $$props2.value);
    if ("id" in $$props2)
      $$invalidate(1, id = $$props2.id);
  };
  $$self.$capture_state = () => ({ value, id });
  $$self.$inject_state = ($$props2) => {
    if ("value" in $$props2)
      $$invalidate(0, value = $$props2.value);
    if ("id" in $$props2)
      $$invalidate(1, id = $$props2.id);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*value*/
    1) {
      if (typeof value === "string") {
        $$invalidate(0, value = value === "true");
      } else if (typeof value === "number") {
        $$invalidate(0, value = value === 1);
      }
    }
  };
  return [value, id, input_change_handler];
}
class Checkbox extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance$8, create_fragment$8, safe_not_equal, { value: 0, id: 1 });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Checkbox",
      options,
      id: create_fragment$8.name
    });
  }
  get value() {
    throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set value(value) {
    throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get id() {
    throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set id(value) {
    throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
}
const file$7 = "src/lib/elements/Checkbox.story.svelte";
function create_default_slot$3(ctx) {
  let div;
  let checkbox;
  let current;
  checkbox = new Checkbox({
    props: { checked: false },
    $$inline: true
  });
  const block = {
    c: function create() {
      div = element("div");
      create_component(checkbox.$$.fragment);
      this.h();
    },
    l: function claim(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      claim_component(checkbox.$$.fragment, div_nodes);
      div_nodes.forEach(detach_dev);
      this.h();
    },
    h: function hydrate() {
      attr_dev(div, "class", "s-QRHVBdNdefmq");
      add_location(div, file$7, 7, 2, 101);
    },
    m: function mount(target, anchor) {
      insert_hydration_dev(target, div, anchor);
      mount_component(checkbox, div, null);
      current = true;
    },
    p: noop,
    i: function intro(local) {
      if (current)
        return;
      transition_in(checkbox.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(checkbox.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching) {
        detach_dev(div);
      }
      destroy_component(checkbox);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot$3.name,
    type: "slot",
    source: "(5:0) <Hst.Story>",
    ctx
  });
  return block;
}
function create_fragment$7(ctx) {
  let hst_story;
  let current;
  hst_story = new /*Hst*/
  ctx[0].Story({
    props: {
      $$slots: { default: [create_default_slot$3] },
      $$scope: { ctx }
    },
    $$inline: true
  });
  const block = {
    c: function create() {
      create_component(hst_story.$$.fragment);
    },
    l: function claim(nodes) {
      claim_component(hst_story.$$.fragment, nodes);
    },
    m: function mount(target, anchor) {
      mount_component(hst_story, target, anchor);
      current = true;
    },
    p: function update(ctx2, [dirty]) {
      const hst_story_changes = {};
      if (dirty & /*$$scope*/
      2) {
        hst_story_changes.$$scope = { dirty, ctx: ctx2 };
      }
      hst_story.$set(hst_story_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(hst_story.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(hst_story.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(hst_story, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment$7.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance$7($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Checkbox_story", slots, []);
  let { Hst } = $$props;
  $$self.$$.on_mount.push(function() {
    if (Hst === void 0 && !("Hst" in $$props || $$self.$$.bound[$$self.$$.props["Hst"]])) {
      console.warn("<Checkbox_story> was created without expected prop 'Hst'");
    }
  });
  const writable_props = ["Hst"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Checkbox_story> was created with unknown prop '${key}'`);
  });
  $$self.$$set = ($$props2) => {
    if ("Hst" in $$props2)
      $$invalidate(0, Hst = $$props2.Hst);
  };
  $$self.$capture_state = () => ({ Hst, Checkbox });
  $$self.$inject_state = ($$props2) => {
    if ("Hst" in $$props2)
      $$invalidate(0, Hst = $$props2.Hst);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [Hst];
}
class Checkbox_story extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance$7, create_fragment$7, safe_not_equal, { Hst: 0 });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Checkbox_story",
      options,
      id: create_fragment$7.name
    });
  }
  get Hst() {
    throw new Error("<Checkbox_story>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set Hst(value) {
    throw new Error("<Checkbox_story>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
}
function getBoundingValue(_v) {
  const v = Math.abs(_v);
  let level = 1;
  const levels = [1, 2, 4, 10, 20, 50, 100, 200, 300, 400, 500, 1e3];
  for (const l of levels) {
    level = l;
    if (l >= v)
      break;
  }
  return _v >= 0 ? level : -level;
}
const file$6 = "src/lib/elements/Float.svelte";
function create_fragment$6(ctx) {
  let div;
  let span;
  let span_style_value;
  let t;
  let input;
  let input_style_value;
  let mounted;
  let dispose;
  const block = {
    c: function create() {
      div = element("div");
      span = element("span");
      t = space();
      input = element("input");
      this.h();
    },
    l: function claim(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      span = claim_element(div_nodes, "SPAN", { class: true, style: true });
      children(span).forEach(detach_dev);
      t = claim_space(div_nodes);
      input = claim_element(div_nodes, "INPUT", {
        id: true,
        step: true,
        max: true,
        min: true,
        type: true,
        style: true,
        class: true
      });
      div_nodes.forEach(detach_dev);
      this.h();
    },
    h: function hydrate() {
      attr_dev(span, "class", "overlay s-7bQ_kN4nOsTx");
      attr_dev(span, "style", span_style_value = `width: ${/*value*/
      (ctx[0] - /*min*/
      ctx[1]) / /*max*/
      (ctx[2] - /*min*/
      ctx[1]) * 100}%`);
      add_location(span, file$6, 102, 2, 2040);
      attr_dev(
        input,
        "id",
        /*id*/
        ctx[4]
      );
      attr_dev(
        input,
        "step",
        /*step*/
        ctx[3]
      );
      attr_dev(
        input,
        "max",
        /*max*/
        ctx[2]
      );
      attr_dev(
        input,
        "min",
        /*min*/
        ctx[1]
      );
      attr_dev(input, "type", "number");
      attr_dev(input, "style", input_style_value = `width:${/*width*/
      ctx[7]};`);
      attr_dev(input, "class", "s-7bQ_kN4nOsTx");
      add_location(input, file$6, 106, 2, 2134);
      attr_dev(div, "class", "component-wrapper s-7bQ_kN4nOsTx");
      toggle_class(
        div,
        "is-down",
        /*isMouseDown*/
        ctx[6]
      );
      add_location(div, file$6, 101, 0, 1978);
    },
    m: function mount(target, anchor) {
      insert_hydration_dev(target, div, anchor);
      append_hydration_dev(div, span);
      append_hydration_dev(div, t);
      append_hydration_dev(div, input);
      set_input_value(
        input,
        /*value*/
        ctx[0]
      );
      ctx[12](input);
      if (!mounted) {
        dispose = [
          listen_dev(
            input,
            "input",
            /*input_input_handler*/
            ctx[11]
          ),
          listen_dev(
            input,
            "keydown",
            /*handleKeyDown*/
            ctx[10],
            false,
            false,
            false,
            false
          ),
          listen_dev(
            input,
            "mousedown",
            /*handleMouseDown*/
            ctx[8],
            false,
            false,
            false,
            false
          ),
          listen_dev(
            input,
            "mouseup",
            /*handleMouseUp*/
            ctx[9],
            false,
            false,
            false,
            false
          )
        ];
        mounted = true;
      }
    },
    p: function update(ctx2, [dirty]) {
      if (dirty & /*value, min, max*/
      7 && span_style_value !== (span_style_value = `width: ${/*value*/
      (ctx2[0] - /*min*/
      ctx2[1]) / /*max*/
      (ctx2[2] - /*min*/
      ctx2[1]) * 100}%`)) {
        attr_dev(span, "style", span_style_value);
      }
      if (dirty & /*id*/
      16) {
        attr_dev(
          input,
          "id",
          /*id*/
          ctx2[4]
        );
      }
      if (dirty & /*step*/
      8) {
        attr_dev(
          input,
          "step",
          /*step*/
          ctx2[3]
        );
      }
      if (dirty & /*max*/
      4) {
        attr_dev(
          input,
          "max",
          /*max*/
          ctx2[2]
        );
      }
      if (dirty & /*min*/
      2) {
        attr_dev(
          input,
          "min",
          /*min*/
          ctx2[1]
        );
      }
      if (dirty & /*width*/
      128 && input_style_value !== (input_style_value = `width:${/*width*/
      ctx2[7]};`)) {
        attr_dev(input, "style", input_style_value);
      }
      if (dirty & /*value*/
      1 && to_number(input.value) !== /*value*/
      ctx2[0]) {
        set_input_value(
          input,
          /*value*/
          ctx2[0]
        );
      }
      if (dirty & /*isMouseDown*/
      64) {
        toggle_class(
          div,
          "is-down",
          /*isMouseDown*/
          ctx2[6]
        );
      }
    },
    i: noop,
    o: noop,
    d: function destroy(detaching) {
      if (detaching) {
        detach_dev(div);
      }
      ctx[12](null);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment$6.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function strip(input) {
  return +parseFloat(input + "").toPrecision(2);
}
function instance$6($$self, $$props, $$invalidate) {
  let width;
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Float", slots, []);
  let { value = 0.5 } = $$props;
  let { step = 0.01 } = $$props;
  let { min = 0 } = $$props;
  let { max = 1 } = $$props;
  let { id = "" } = $$props;
  const dispatch = createEventDispatcher();
  let inputEl;
  let oldValue;
  function handleChange() {
    if (value === oldValue)
      return;
    oldValue = value;
    dispatch("change", parseFloat(value + ""));
  }
  let isMouseDown = false;
  let downV = 0;
  let vx = 0;
  let rect;
  function handleMouseDown(ev) {
    ev.preventDefault();
    inputEl.focus();
    $$invalidate(6, isMouseDown = true);
    downV = value;
    rect = inputEl.getBoundingClientRect();
    window.removeEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "ew-resize";
  }
  function handleMouseUp() {
    $$invalidate(6, isMouseDown = false);
    if (downV === value) {
      inputEl.focus();
    }
    setTimeout(
      () => {
        if (value >= 0) {
          $$invalidate(2, max = getBoundingValue(value));
          $$invalidate(1, min = 0);
        } else {
          $$invalidate(1, min = getBoundingValue(value));
          $$invalidate(2, max = 0);
        }
      },
      500
    );
    document.body.style.cursor = "unset";
    window.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("mousemove", handleMouseMove);
  }
  function handleKeyDown(ev) {
    if (ev.key === "Escape" || ev.key === "Enter") {
      handleMouseUp();
      inputEl.blur();
    }
  }
  function handleMouseMove(ev) {
    vx = (ev.clientX - rect.left) / rect.width;
    if (ev.ctrlKey) {
      let v = min + (max - min) * vx;
      $$invalidate(0, value = v);
    } else {
      $$invalidate(0, value = Math.max(Math.min(min + (max - min) * vx, max), min));
    }
  }
  const writable_props = ["value", "step", "min", "max", "id"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Float> was created with unknown prop '${key}'`);
  });
  function input_input_handler() {
    value = to_number(this.value);
    $$invalidate(0, value);
  }
  function input_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      inputEl = $$value;
      $$invalidate(5, inputEl);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("value" in $$props2)
      $$invalidate(0, value = $$props2.value);
    if ("step" in $$props2)
      $$invalidate(3, step = $$props2.step);
    if ("min" in $$props2)
      $$invalidate(1, min = $$props2.min);
    if ("max" in $$props2)
      $$invalidate(2, max = $$props2.max);
    if ("id" in $$props2)
      $$invalidate(4, id = $$props2.id);
  };
  $$self.$capture_state = () => ({
    createEventDispatcher,
    getBoundingValue,
    value,
    step,
    min,
    max,
    id,
    strip,
    dispatch,
    inputEl,
    oldValue,
    handleChange,
    isMouseDown,
    downV,
    vx,
    rect,
    handleMouseDown,
    handleMouseUp,
    handleKeyDown,
    handleMouseMove,
    width
  });
  $$self.$inject_state = ($$props2) => {
    if ("value" in $$props2)
      $$invalidate(0, value = $$props2.value);
    if ("step" in $$props2)
      $$invalidate(3, step = $$props2.step);
    if ("min" in $$props2)
      $$invalidate(1, min = $$props2.min);
    if ("max" in $$props2)
      $$invalidate(2, max = $$props2.max);
    if ("id" in $$props2)
      $$invalidate(4, id = $$props2.id);
    if ("inputEl" in $$props2)
      $$invalidate(5, inputEl = $$props2.inputEl);
    if ("oldValue" in $$props2)
      oldValue = $$props2.oldValue;
    if ("isMouseDown" in $$props2)
      $$invalidate(6, isMouseDown = $$props2.isMouseDown);
    if ("downV" in $$props2)
      downV = $$props2.downV;
    if ("vx" in $$props2)
      vx = $$props2.vx;
    if ("rect" in $$props2)
      rect = $$props2.rect;
    if ("width" in $$props2)
      $$invalidate(7, width = $$props2.width);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*value*/
    1) {
      if ((value || 0).toString().length > 5) {
        $$invalidate(0, value = strip(value || 0));
      }
    }
    if ($$self.$$.dirty & /*value*/
    1) {
      value !== void 0 && handleChange();
    }
    if ($$self.$$.dirty & /*value*/
    1) {
      $$invalidate(7, width = Number.isFinite(value) ? Math.max(((value == null ? void 0 : value.toString().length) ?? 1) * 8, 50) + "px" : "20px");
    }
  };
  return [
    value,
    min,
    max,
    step,
    id,
    inputEl,
    isMouseDown,
    width,
    handleMouseDown,
    handleMouseUp,
    handleKeyDown,
    input_input_handler,
    input_binding
  ];
}
class Float extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance$6, create_fragment$6, safe_not_equal, { value: 0, step: 3, min: 1, max: 2, id: 4 });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Float",
      options,
      id: create_fragment$6.name
    });
  }
  get value() {
    throw new Error("<Float>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set value(value) {
    throw new Error("<Float>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get step() {
    throw new Error("<Float>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set step(value) {
    throw new Error("<Float>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get min() {
    throw new Error("<Float>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set min(value) {
    throw new Error("<Float>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get max() {
    throw new Error("<Float>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set max(value) {
    throw new Error("<Float>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get id() {
    throw new Error("<Float>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set id(value) {
    throw new Error("<Float>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
}
const file$5 = "src/lib/elements/Float.story.svelte";
function create_default_slot$2(ctx) {
  let div;
  let float;
  let current;
  float = new Float({
    props: { value: 0, min: 0, max: 6.9 },
    $$inline: true
  });
  const block = {
    c: function create() {
      div = element("div");
      create_component(float.$$.fragment);
      this.h();
    },
    l: function claim(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      claim_component(float.$$.fragment, div_nodes);
      div_nodes.forEach(detach_dev);
      this.h();
    },
    h: function hydrate() {
      attr_dev(div, "class", "s-ixAoiIy-gyh_");
      add_location(div, file$5, 7, 2, 95);
    },
    m: function mount(target, anchor) {
      insert_hydration_dev(target, div, anchor);
      mount_component(float, div, null);
      current = true;
    },
    p: noop,
    i: function intro(local) {
      if (current)
        return;
      transition_in(float.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(float.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching) {
        detach_dev(div);
      }
      destroy_component(float);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot$2.name,
    type: "slot",
    source: "(5:0) <Hst.Story>",
    ctx
  });
  return block;
}
function create_fragment$5(ctx) {
  let hst_story;
  let current;
  hst_story = new /*Hst*/
  ctx[0].Story({
    props: {
      $$slots: { default: [create_default_slot$2] },
      $$scope: { ctx }
    },
    $$inline: true
  });
  const block = {
    c: function create() {
      create_component(hst_story.$$.fragment);
    },
    l: function claim(nodes) {
      claim_component(hst_story.$$.fragment, nodes);
    },
    m: function mount(target, anchor) {
      mount_component(hst_story, target, anchor);
      current = true;
    },
    p: function update(ctx2, [dirty]) {
      const hst_story_changes = {};
      if (dirty & /*$$scope*/
      2) {
        hst_story_changes.$$scope = { dirty, ctx: ctx2 };
      }
      hst_story.$set(hst_story_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(hst_story.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(hst_story.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(hst_story, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment$5.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance$5($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Float_story", slots, []);
  let { Hst } = $$props;
  $$self.$$.on_mount.push(function() {
    if (Hst === void 0 && !("Hst" in $$props || $$self.$$.bound[$$self.$$.props["Hst"]])) {
      console.warn("<Float_story> was created without expected prop 'Hst'");
    }
  });
  const writable_props = ["Hst"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Float_story> was created with unknown prop '${key}'`);
  });
  $$self.$$set = ($$props2) => {
    if ("Hst" in $$props2)
      $$invalidate(0, Hst = $$props2.Hst);
  };
  $$self.$capture_state = () => ({ Hst, Float });
  $$self.$inject_state = ($$props2) => {
    if ("Hst" in $$props2)
      $$invalidate(0, Hst = $$props2.Hst);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [Hst];
}
class Float_story extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance$5, create_fragment$5, safe_not_equal, { Hst: 0 });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Float_story",
      options,
      id: create_fragment$5.name
    });
  }
  get Hst() {
    throw new Error("<Float_story>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set Hst(value) {
    throw new Error("<Float_story>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
}
const file$4 = "src/lib/elements/Integer.svelte";
function create_if_block(ctx) {
  let span;
  let span_style_value;
  const block = {
    c: function create() {
      span = element("span");
      this.h();
    },
    l: function claim(nodes) {
      span = claim_element(nodes, "SPAN", { class: true, style: true });
      children(span).forEach(detach_dev);
      this.h();
    },
    h: function hydrate() {
      attr_dev(span, "class", "overlay s-mdEAMJCfSFSg");
      attr_dev(span, "style", span_style_value = `width: ${Math.min(
        /*value*/
        (ctx[0] - /*min*/
        ctx[1]) / /*max*/
        (ctx[2] - /*min*/
        ctx[1]),
        1
      ) * 100}%`);
      add_location(span, file$4, 89, 4, 1949);
    },
    m: function mount(target, anchor) {
      insert_hydration_dev(target, span, anchor);
    },
    p: function update(ctx2, dirty) {
      if (dirty & /*value, min, max*/
      7 && span_style_value !== (span_style_value = `width: ${Math.min(
        /*value*/
        (ctx2[0] - /*min*/
        ctx2[1]) / /*max*/
        (ctx2[2] - /*min*/
        ctx2[1]),
        1
      ) * 100}%`)) {
        attr_dev(span, "style", span_style_value);
      }
    },
    d: function destroy(detaching) {
      if (detaching) {
        detach_dev(span);
      }
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block.name,
    type: "if",
    source: '(75:2) {#if typeof min !== \\"undefined\\" && typeof max !== \\"undefined\\"}',
    ctx
  });
  return block;
}
function create_fragment$4(ctx) {
  let div;
  let t0;
  let button0;
  let textContent = "-";
  let t2;
  let input;
  let input_style_value;
  let t3;
  let button1;
  let textContent_1 = "+";
  let mounted;
  let dispose;
  let if_block = typeof /*min*/
  ctx[1] !== "undefined" && typeof /*max*/
  ctx[2] !== "undefined" && create_if_block(ctx);
  const block = {
    c: function create() {
      div = element("div");
      if (if_block)
        if_block.c();
      t0 = space();
      button0 = element("button");
      button0.textContent = textContent;
      t2 = space();
      input = element("input");
      t3 = space();
      button1 = element("button");
      button1.textContent = textContent_1;
      this.h();
    },
    l: function claim(nodes) {
      div = claim_element(nodes, "DIV", {
        class: true,
        role: true,
        tabindex: true,
        "aria-valuenow": true
      });
      var div_nodes = children(div);
      if (if_block)
        if_block.l(div_nodes);
      t0 = claim_space(div_nodes);
      button0 = claim_element(div_nodes, "BUTTON", { class: true, ["data-svelte-h"]: true });
      if (get_svelte_dataset(button0) !== "svelte-1bw2b1l")
        button0.textContent = textContent;
      t2 = claim_space(div_nodes);
      input = claim_element(div_nodes, "INPUT", {
        step: true,
        max: true,
        min: true,
        type: true,
        style: true,
        class: true
      });
      t3 = claim_space(div_nodes);
      button1 = claim_element(div_nodes, "BUTTON", { class: true, ["data-svelte-h"]: true });
      if (get_svelte_dataset(button1) !== "svelte-4ac98d")
        button1.textContent = textContent_1;
      div_nodes.forEach(detach_dev);
      this.h();
    },
    h: function hydrate() {
      attr_dev(button0, "class", "s-mdEAMJCfSFSg");
      add_location(button0, file$4, 94, 2, 2068);
      attr_dev(
        input,
        "step",
        /*step*/
        ctx[3]
      );
      attr_dev(
        input,
        "max",
        /*max*/
        ctx[2]
      );
      attr_dev(
        input,
        "min",
        /*min*/
        ctx[1]
      );
      attr_dev(input, "type", "number");
      attr_dev(input, "style", input_style_value = `width:${/*width*/
      ctx[6]};`);
      attr_dev(input, "class", "s-mdEAMJCfSFSg");
      add_location(input, file$4, 95, 2, 2126);
      attr_dev(button1, "class", "s-mdEAMJCfSFSg");
      add_location(button1, file$4, 105, 2, 2259);
      attr_dev(div, "class", "component-wrapper s-mdEAMJCfSFSg");
      attr_dev(div, "role", "slider");
      attr_dev(div, "tabindex", "0");
      attr_dev(
        div,
        "aria-valuenow",
        /*value*/
        ctx[0]
      );
      add_location(div, file$4, 79, 0, 1706);
    },
    m: function mount(target, anchor) {
      insert_hydration_dev(target, div, anchor);
      if (if_block)
        if_block.m(div, null);
      append_hydration_dev(div, t0);
      append_hydration_dev(div, button0);
      append_hydration_dev(div, t2);
      append_hydration_dev(div, input);
      set_input_value(
        input,
        /*value*/
        ctx[0]
      );
      ctx[13](input);
      append_hydration_dev(div, t3);
      append_hydration_dev(div, button1);
      ctx[15](div);
      if (!mounted) {
        dispose = [
          listen_dev(
            button0,
            "click",
            /*click_handler*/
            ctx[11],
            false,
            false,
            false,
            false
          ),
          listen_dev(
            input,
            "input",
            /*input_input_handler*/
            ctx[12]
          ),
          listen_dev(
            button1,
            "click",
            /*click_handler_1*/
            ctx[14],
            false,
            false,
            false,
            false
          ),
          listen_dev(
            div,
            "mousedown",
            /*handleMouseDown*/
            ctx[8],
            false,
            false,
            false,
            false
          ),
          listen_dev(
            div,
            "mouseup",
            /*handleMouseUp*/
            ctx[9],
            false,
            false,
            false,
            false
          )
        ];
        mounted = true;
      }
    },
    p: function update(ctx2, [dirty]) {
      if (typeof /*min*/
      ctx2[1] !== "undefined" && typeof /*max*/
      ctx2[2] !== "undefined") {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          if_block.m(div, t0);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*step*/
      8) {
        attr_dev(
          input,
          "step",
          /*step*/
          ctx2[3]
        );
      }
      if (dirty & /*max*/
      4) {
        attr_dev(
          input,
          "max",
          /*max*/
          ctx2[2]
        );
      }
      if (dirty & /*min*/
      2) {
        attr_dev(
          input,
          "min",
          /*min*/
          ctx2[1]
        );
      }
      if (dirty & /*width*/
      64 && input_style_value !== (input_style_value = `width:${/*width*/
      ctx2[6]};`)) {
        attr_dev(input, "style", input_style_value);
      }
      if (dirty & /*value*/
      1 && to_number(input.value) !== /*value*/
      ctx2[0]) {
        set_input_value(
          input,
          /*value*/
          ctx2[0]
        );
      }
      if (dirty & /*value*/
      1) {
        attr_dev(
          div,
          "aria-valuenow",
          /*value*/
          ctx2[0]
        );
      }
    },
    i: noop,
    o: noop,
    d: function destroy(detaching) {
      if (detaching) {
        detach_dev(div);
      }
      if (if_block)
        if_block.d();
      ctx[13](null);
      ctx[15](null);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment$4.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance$4($$self, $$props, $$invalidate) {
  let width;
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Integer", slots, []);
  const dispatch = createEventDispatcher();
  let { min = void 0 } = $$props;
  let { max = void 0 } = $$props;
  let { step = 1 } = $$props;
  let { value = 0 } = $$props;
  let { id = "" } = $$props;
  if (!value) {
    value = 0;
  }
  let inputEl;
  let wrapper;
  let prev = -1;
  function update() {
    if (prev === value)
      return;
    prev = value;
    dispatch("change", parseFloat(value + ""));
  }
  function handleChange(change) {
    $$invalidate(0, value = Math.max(min ?? -Infinity, Math.min(+value + change, max ?? Infinity)));
  }
  let downX = 0;
  let downV = 0;
  let rect;
  function handleMouseDown(ev) {
    ev.preventDefault();
    downV = value;
    downX = ev.clientX;
    rect = wrapper.getBoundingClientRect();
    window.removeEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "ew-resize";
  }
  function handleMouseUp() {
    if (downV === value) {
      inputEl.focus();
    } else {
      inputEl.blur();
    }
    document.body.style.cursor = "unset";
    window.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("mousemove", handleMouseMove);
  }
  function handleMouseMove(ev) {
    if (!ev.ctrlKey && typeof min === "number" && typeof max === "number") {
      const vx = (ev.clientX - rect.left) / rect.width;
      $$invalidate(0, value = Math.max(Math.min(Math.floor(min + (max - min) * vx), max), min));
    } else {
      const vx = ev.clientX - downX;
      $$invalidate(0, value = downV + Math.floor(vx / 10));
    }
  }
  const writable_props = ["min", "max", "step", "value", "id"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Integer> was created with unknown prop '${key}'`);
  });
  const click_handler = () => handleChange(-step);
  function input_input_handler() {
    value = to_number(this.value);
    $$invalidate(0, value);
  }
  function input_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      inputEl = $$value;
      $$invalidate(4, inputEl);
    });
  }
  const click_handler_1 = () => handleChange(+step);
  function div_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      wrapper = $$value;
      $$invalidate(5, wrapper);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("min" in $$props2)
      $$invalidate(1, min = $$props2.min);
    if ("max" in $$props2)
      $$invalidate(2, max = $$props2.max);
    if ("step" in $$props2)
      $$invalidate(3, step = $$props2.step);
    if ("value" in $$props2)
      $$invalidate(0, value = $$props2.value);
    if ("id" in $$props2)
      $$invalidate(10, id = $$props2.id);
  };
  $$self.$capture_state = () => ({
    createEventDispatcher,
    dispatch,
    min,
    max,
    step,
    value,
    id,
    inputEl,
    wrapper,
    prev,
    update,
    handleChange,
    downX,
    downV,
    rect,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    width
  });
  $$self.$inject_state = ($$props2) => {
    if ("min" in $$props2)
      $$invalidate(1, min = $$props2.min);
    if ("max" in $$props2)
      $$invalidate(2, max = $$props2.max);
    if ("step" in $$props2)
      $$invalidate(3, step = $$props2.step);
    if ("value" in $$props2)
      $$invalidate(0, value = $$props2.value);
    if ("id" in $$props2)
      $$invalidate(10, id = $$props2.id);
    if ("inputEl" in $$props2)
      $$invalidate(4, inputEl = $$props2.inputEl);
    if ("wrapper" in $$props2)
      $$invalidate(5, wrapper = $$props2.wrapper);
    if ("prev" in $$props2)
      prev = $$props2.prev;
    if ("downX" in $$props2)
      downX = $$props2.downX;
    if ("downV" in $$props2)
      downV = $$props2.downV;
    if ("rect" in $$props2)
      rect = $$props2.rect;
    if ("width" in $$props2)
      $$invalidate(6, width = $$props2.width);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*value*/
    1) {
      value !== void 0 && update();
    }
    if ($$self.$$.dirty & /*value*/
    1) {
      $$invalidate(6, width = Number.isFinite(value) ? Math.max(((value == null ? void 0 : value.toString().length) ?? 1) * 8, 30) + "px" : "20px");
    }
  };
  return [
    value,
    min,
    max,
    step,
    inputEl,
    wrapper,
    width,
    handleChange,
    handleMouseDown,
    handleMouseUp,
    id,
    click_handler,
    input_input_handler,
    input_binding,
    click_handler_1,
    div_binding
  ];
}
class Integer extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance$4, create_fragment$4, safe_not_equal, {
      min: 1,
      max: 2,
      step: 3,
      value: 0,
      id: 10
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Integer",
      options,
      id: create_fragment$4.name
    });
  }
  get min() {
    return this.$$.ctx[1];
  }
  set min(min) {
    this.$$set({ min });
    flush();
  }
  get max() {
    return this.$$.ctx[2];
  }
  set max(max) {
    this.$$set({ max });
    flush();
  }
  get step() {
    return this.$$.ctx[3];
  }
  set step(step) {
    this.$$set({ step });
    flush();
  }
  get value() {
    return this.$$.ctx[0];
  }
  set value(value) {
    this.$$set({ value });
    flush();
  }
  get id() {
    return this.$$.ctx[10];
  }
  set id(id) {
    this.$$set({ id });
    flush();
  }
}
const file$3 = "src/lib/helpers/StorySettings.svelte";
function get_each_context$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[0] = list[i];
  return child_ctx;
}
function create_each_block$1(ctx) {
  let option;
  const block = {
    c: function create() {
      option = element("option");
      this.h();
    },
    l: function claim(nodes) {
      option = claim_element(nodes, "OPTION", {});
      var option_nodes = children(option);
      option_nodes.forEach(detach_dev);
      this.h();
    },
    h: function hydrate() {
      option.__value = /*theme*/
      ctx[0];
      set_input_value(option, option.__value);
      add_location(option, file$3, 27, 4, 542);
    },
    m: function mount(target, anchor) {
      insert_hydration_dev(target, option, anchor);
    },
    p: noop,
    d: function destroy(detaching) {
      if (detaching) {
        detach_dev(option);
      }
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_each_block$1.name,
    type: "each",
    source: "(25:2) {#each themes as theme}",
    ctx
  });
  return block;
}
function create_fragment$3(ctx) {
  let select;
  let mounted;
  let dispose;
  let each_value = ensure_array_like_dev(
    /*themes*/
    ctx[1]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
  }
  const block = {
    c: function create() {
      select = element("select");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      this.h();
    },
    l: function claim(nodes) {
      select = claim_element(nodes, "SELECT", {});
      var select_nodes = children(select);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].l(select_nodes);
      }
      select_nodes.forEach(detach_dev);
      this.h();
    },
    h: function hydrate() {
      if (
        /*theme*/
        ctx[0] === void 0
      )
        add_render_callback(() => (
          /*select_change_handler*/
          ctx[2].call(select)
        ));
      add_location(select, file$3, 25, 0, 484);
    },
    m: function mount(target, anchor) {
      insert_hydration_dev(target, select, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(select, null);
        }
      }
      select_option(
        select,
        /*theme*/
        ctx[0],
        true
      );
      if (!mounted) {
        dispose = listen_dev(
          select,
          "change",
          /*select_change_handler*/
          ctx[2]
        );
        mounted = true;
      }
    },
    p: function update(ctx2, [dirty]) {
      if (dirty & /*themes*/
      2) {
        each_value = ensure_array_like_dev(
          /*themes*/
          ctx2[1]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$1(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(select, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (dirty & /*theme, themes*/
      3) {
        select_option(
          select,
          /*theme*/
          ctx2[0]
        );
      }
    },
    i: noop,
    o: noop,
    d: function destroy(detaching) {
      if (detaching) {
        detach_dev(select);
      }
      destroy_each(each_blocks, detaching);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment$3.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance$3($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("StorySettings", slots, []);
  const themes = ["dark", "light", "catppuccin", "solarized", "high-contrast", "nord", "dracula"];
  let theme = themes[0];
  const writable_props = [];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<StorySettings> was created with unknown prop '${key}'`);
  });
  function select_change_handler() {
    theme = select_value(this);
    $$invalidate(0, theme);
    $$invalidate(1, themes);
  }
  $$self.$capture_state = () => ({ themes, theme });
  $$self.$inject_state = ($$props2) => {
    if ("theme" in $$props2)
      $$invalidate(0, theme = $$props2.theme);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*theme*/
    1) {
      if (theme) {
        const classes = document.body.classList;
        const newClassName = `theme-${theme}`;
        for (const className of classes) {
          if (className.startsWith("theme-") && className !== newClassName) {
            classes.remove(className);
          }
        }
        document.body.classList.add(newClassName);
      }
    }
  };
  return [theme, themes, select_change_handler];
}
class StorySettings extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance$3, create_fragment$3, safe_not_equal, {});
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "StorySettings",
      options,
      id: create_fragment$3.name
    });
  }
}
const file$2 = "src/lib/elements/Integer.story.svelte";
function create_default_slot$1(ctx) {
  let div;
  let integer;
  let current;
  integer = new Integer({
    props: { value: 5, min: 0, max: 42 },
    $$inline: true
  });
  const block = {
    c: function create() {
      div = element("div");
      create_component(integer.$$.fragment);
      this.h();
    },
    l: function claim(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      claim_component(integer.$$.fragment, div_nodes);
      div_nodes.forEach(detach_dev);
      this.h();
    },
    h: function hydrate() {
      attr_dev(div, "class", "s-c5uIg08NK9i-");
      add_location(div, file$2, 8, 2, 160);
    },
    m: function mount(target, anchor) {
      insert_hydration_dev(target, div, anchor);
      mount_component(integer, div, null);
      current = true;
    },
    p: noop,
    i: function intro(local) {
      if (current)
        return;
      transition_in(integer.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(integer.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching) {
        detach_dev(div);
      }
      destroy_component(integer);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot$1.name,
    type: "slot",
    source: "(6:0) <Hst.Story>",
    ctx
  });
  return block;
}
function create_controls_slot(ctx) {
  let storysettings;
  let current;
  storysettings = new StorySettings({ $$inline: true });
  const block = {
    c: function create() {
      create_component(storysettings.$$.fragment);
    },
    l: function claim(nodes) {
      claim_component(storysettings.$$.fragment, nodes);
    },
    m: function mount(target, anchor) {
      mount_component(storysettings, target, anchor);
      current = true;
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(storysettings.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(storysettings.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(storysettings, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_controls_slot.name,
    type: "slot",
    source: '(10:3) <svelte:fragment slot=\\"controls\\">',
    ctx
  });
  return block;
}
function create_fragment$2(ctx) {
  let hst_story;
  let current;
  hst_story = new /*Hst*/
  ctx[0].Story({
    props: {
      $$slots: {
        controls: [create_controls_slot],
        default: [create_default_slot$1]
      },
      $$scope: { ctx }
    },
    $$inline: true
  });
  const block = {
    c: function create() {
      create_component(hst_story.$$.fragment);
    },
    l: function claim(nodes) {
      claim_component(hst_story.$$.fragment, nodes);
    },
    m: function mount(target, anchor) {
      mount_component(hst_story, target, anchor);
      current = true;
    },
    p: function update(ctx2, [dirty]) {
      const hst_story_changes = {};
      if (dirty & /*$$scope*/
      2) {
        hst_story_changes.$$scope = { dirty, ctx: ctx2 };
      }
      hst_story.$set(hst_story_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(hst_story.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(hst_story.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(hst_story, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment$2.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance$2($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Integer_story", slots, []);
  let { Hst } = $$props;
  $$self.$$.on_mount.push(function() {
    if (Hst === void 0 && !("Hst" in $$props || $$self.$$.bound[$$self.$$.props["Hst"]])) {
      console.warn("<Integer_story> was created without expected prop 'Hst'");
    }
  });
  const writable_props = ["Hst"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Integer_story> was created with unknown prop '${key}'`);
  });
  $$self.$$set = ($$props2) => {
    if ("Hst" in $$props2)
      $$invalidate(0, Hst = $$props2.Hst);
  };
  $$self.$capture_state = () => ({ Hst, Integer, StorySettings });
  $$self.$inject_state = ($$props2) => {
    if ("Hst" in $$props2)
      $$invalidate(0, Hst = $$props2.Hst);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [Hst];
}
class Integer_story extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance$2, create_fragment$2, safe_not_equal, { Hst: 0 });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Integer_story",
      options,
      id: create_fragment$2.name
    });
  }
  get Hst() {
    throw new Error("<Integer_story>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set Hst(value) {
    throw new Error("<Integer_story>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
}
const file$1 = "src/lib/elements/Select.svelte";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[4] = list[i];
  child_ctx[6] = i;
  return child_ctx;
}
function create_each_block(ctx) {
  let option;
  let t_value = (
    /*label*/
    ctx[4] + ""
  );
  let t;
  const block = {
    c: function create() {
      option = element("option");
      t = text(t_value);
      this.h();
    },
    l: function claim(nodes) {
      option = claim_element(nodes, "OPTION", {});
      var option_nodes = children(option);
      t = claim_text(option_nodes, t_value);
      option_nodes.forEach(detach_dev);
      this.h();
    },
    h: function hydrate() {
      option.__value = /*i*/
      ctx[6];
      set_input_value(option, option.__value);
      add_location(option, file$1, 8, 4, 150);
    },
    m: function mount(target, anchor) {
      insert_hydration_dev(target, option, anchor);
      append_hydration_dev(option, t);
    },
    p: function update(ctx2, dirty) {
      if (dirty & /*options*/
      2 && t_value !== (t_value = /*label*/
      ctx2[4] + ""))
        set_data_dev(t, t_value);
    },
    d: function destroy(detaching) {
      if (detaching) {
        detach_dev(option);
      }
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_each_block.name,
    type: "each",
    source: "(7:2) {#each options as label, i}",
    ctx
  });
  return block;
}
function create_fragment$1(ctx) {
  let select;
  let mounted;
  let dispose;
  let each_value = ensure_array_like_dev(
    /*options*/
    ctx[1]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  const block = {
    c: function create() {
      select = element("select");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      this.h();
    },
    l: function claim(nodes) {
      select = claim_element(nodes, "SELECT", { id: true, class: true });
      var select_nodes = children(select);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].l(select_nodes);
      }
      select_nodes.forEach(detach_dev);
      this.h();
    },
    h: function hydrate() {
      attr_dev(
        select,
        "id",
        /*id*/
        ctx[2]
      );
      attr_dev(select, "class", "s-NKPjzx4oHzNZ");
      if (
        /*value*/
        ctx[0] === void 0
      )
        add_render_callback(() => (
          /*select_change_handler*/
          ctx[3].call(select)
        ));
      add_location(select, file$1, 6, 0, 91);
    },
    m: function mount(target, anchor) {
      insert_hydration_dev(target, select, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(select, null);
        }
      }
      select_option(
        select,
        /*value*/
        ctx[0],
        true
      );
      if (!mounted) {
        dispose = listen_dev(
          select,
          "change",
          /*select_change_handler*/
          ctx[3]
        );
        mounted = true;
      }
    },
    p: function update(ctx2, [dirty]) {
      if (dirty & /*options*/
      2) {
        each_value = ensure_array_like_dev(
          /*options*/
          ctx2[1]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(select, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (dirty & /*id*/
      4) {
        attr_dev(
          select,
          "id",
          /*id*/
          ctx2[2]
        );
      }
      if (dirty & /*value*/
      1) {
        select_option(
          select,
          /*value*/
          ctx2[0]
        );
      }
    },
    i: noop,
    o: noop,
    d: function destroy(detaching) {
      if (detaching) {
        detach_dev(select);
      }
      destroy_each(each_blocks, detaching);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment$1.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance$1($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Select", slots, []);
  let { options = [] } = $$props;
  let { value = 0 } = $$props;
  let { id } = $$props;
  $$self.$$.on_mount.push(function() {
    if (id === void 0 && !("id" in $$props || $$self.$$.bound[$$self.$$.props["id"]])) {
      console.warn("<Select> was created without expected prop 'id'");
    }
  });
  const writable_props = ["options", "value", "id"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Select> was created with unknown prop '${key}'`);
  });
  function select_change_handler() {
    value = select_value(this);
    $$invalidate(0, value);
  }
  $$self.$$set = ($$props2) => {
    if ("options" in $$props2)
      $$invalidate(1, options = $$props2.options);
    if ("value" in $$props2)
      $$invalidate(0, value = $$props2.value);
    if ("id" in $$props2)
      $$invalidate(2, id = $$props2.id);
  };
  $$self.$capture_state = () => ({ options, value, id });
  $$self.$inject_state = ($$props2) => {
    if ("options" in $$props2)
      $$invalidate(1, options = $$props2.options);
    if ("value" in $$props2)
      $$invalidate(0, value = $$props2.value);
    if ("id" in $$props2)
      $$invalidate(2, id = $$props2.id);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [value, options, id, select_change_handler];
}
class Select extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance$1, create_fragment$1, safe_not_equal, { options: 1, value: 0, id: 2 });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Select",
      options,
      id: create_fragment$1.name
    });
  }
  get options() {
    throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set options(value) {
    throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get value() {
    throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set value(value) {
    throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get id() {
    throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set id(value) {
    throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
}
const file = "src/lib/elements/Select.story.svelte";
function create_default_slot(ctx) {
  let div;
  let select;
  let current;
  select = new Select({
    props: {
      value: "banana",
      options: ["strawberry", "apple", "banana"]
    },
    $$inline: true
  });
  const block = {
    c: function create() {
      div = element("div");
      create_component(select.$$.fragment);
      this.h();
    },
    l: function claim(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      claim_component(select.$$.fragment, div_nodes);
      div_nodes.forEach(detach_dev);
      this.h();
    },
    h: function hydrate() {
      attr_dev(div, "class", "s-fW0cLvH8hir4");
      add_location(div, file, 7, 2, 97);
    },
    m: function mount(target, anchor) {
      insert_hydration_dev(target, div, anchor);
      mount_component(select, div, null);
      current = true;
    },
    p: noop,
    i: function intro(local) {
      if (current)
        return;
      transition_in(select.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(select.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching) {
        detach_dev(div);
      }
      destroy_component(select);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot.name,
    type: "slot",
    source: "(5:0) <Hst.Story>",
    ctx
  });
  return block;
}
function create_fragment(ctx) {
  let hst_story;
  let current;
  hst_story = new /*Hst*/
  ctx[0].Story({
    props: {
      $$slots: { default: [create_default_slot] },
      $$scope: { ctx }
    },
    $$inline: true
  });
  const block = {
    c: function create() {
      create_component(hst_story.$$.fragment);
    },
    l: function claim(nodes) {
      claim_component(hst_story.$$.fragment, nodes);
    },
    m: function mount(target, anchor) {
      mount_component(hst_story, target, anchor);
      current = true;
    },
    p: function update(ctx2, [dirty]) {
      const hst_story_changes = {};
      if (dirty & /*$$scope*/
      2) {
        hst_story_changes.$$scope = { dirty, ctx: ctx2 };
      }
      hst_story.$set(hst_story_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(hst_story.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(hst_story.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(hst_story, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Select_story", slots, []);
  let { Hst } = $$props;
  $$self.$$.on_mount.push(function() {
    if (Hst === void 0 && !("Hst" in $$props || $$self.$$.bound[$$self.$$.props["Hst"]])) {
      console.warn("<Select_story> was created without expected prop 'Hst'");
    }
  });
  const writable_props = ["Hst"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Select_story> was created with unknown prop '${key}'`);
  });
  $$self.$$set = ($$props2) => {
    if ("Hst" in $$props2)
      $$invalidate(0, Hst = $$props2.Hst);
  };
  $$self.$capture_state = () => ({ Hst, Select });
  $$self.$inject_state = ($$props2) => {
    if ("Hst" in $$props2)
      $$invalidate(0, Hst = $$props2.Hst);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [Hst];
}
class Select_story extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance, create_fragment, safe_not_equal, { Hst: 0 });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Select_story",
      options,
      id: create_fragment.name
    });
  }
  get Hst() {
    throw new Error("<Select_story>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set Hst(value) {
    throw new Error("<Select_story>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
}
let files = [
  { "id": "src-lib-elements-checkbox-story-svelte", "path": ["Checkbox"], "filePath": "src/lib/elements/Checkbox.story.svelte", "story": { "id": "src-lib-elements-checkbox-story-svelte", "title": "Checkbox", "group": null, "layout": { "type": "single", "iframe": true }, "icon": null, "iconColor": null, "docsOnly": false, "variants": [{ "id": "_default", "title": "default" }] }, "supportPluginId": "svelte4", "index": 0, component: Checkbox_story, source: () => __vitePreload(() => import("./__resolved__virtual_story-source_src-lib-elements-checkbox-story-svelte-BdydEysz.js"), true ? [] : void 0) },
  { "id": "src-lib-elements-float-story-svelte", "path": ["Float"], "filePath": "src/lib/elements/Float.story.svelte", "story": { "id": "src-lib-elements-float-story-svelte", "title": "Float", "group": null, "layout": { "type": "single", "iframe": true }, "icon": null, "iconColor": null, "docsOnly": false, "variants": [{ "id": "_default", "title": "default" }] }, "supportPluginId": "svelte4", "index": 1, component: Float_story, source: () => __vitePreload(() => import("./__resolved__virtual_story-source_src-lib-elements-float-story-svelte-DXuET9ZY.js"), true ? [] : void 0) },
  { "id": "src-lib-elements-integer-story-svelte", "path": ["Integer"], "filePath": "src/lib/elements/Integer.story.svelte", "story": { "id": "src-lib-elements-integer-story-svelte", "title": "Integer", "group": null, "layout": { "type": "single", "iframe": true }, "icon": null, "iconColor": null, "docsOnly": false, "variants": [{ "id": "_default", "title": "default" }] }, "supportPluginId": "svelte4", "index": 2, component: Integer_story, source: () => __vitePreload(() => import("./__resolved__virtual_story-source_src-lib-elements-integer-story-svelte-IirIfVMy.js"), true ? [] : void 0) },
  { "id": "src-lib-elements-select-story-svelte", "path": ["Select"], "filePath": "src/lib/elements/Select.story.svelte", "story": { "id": "src-lib-elements-select-story-svelte", "title": "Select", "group": null, "layout": { "type": "single", "iframe": true }, "icon": null, "iconColor": null, "docsOnly": false, "variants": [{ "id": "_default", "title": "default" }] }, "supportPluginId": "svelte4", "index": 3, component: Select_story, source: () => __vitePreload(() => import("./__resolved__virtual_story-source_src-lib-elements-select-story-svelte-BRO43j7_.js"), true ? [] : void 0) }
];
let tree = [{ "title": "Checkbox", "index": 0 }, { "title": "Float", "index": 1 }, { "title": "Integer", "index": 2 }, { "title": "Select", "index": 3 }];
const config = { "plugins": [{ "name": "builtin:tailwind-tokens" }, { "name": "builtin:vanilla-support", "supportPlugin": { "id": "vanilla", "moduleName": "/home/max/Projects/nodes/node_modules/.pnpm/histoire@0.17.17_@types+node@20.12.7_sass@1.75.0_vite@5.2.9_@types+node@20.12.7_sass@1.75.0_/node_modules/histoire/dist/node/builtin-plugins/vanilla-support", "setupFn": "setupVanilla" } }, { "name": "@histoire/plugin-svelte", "supportPlugin": { "id": "svelte4", "moduleName": "@histoire/plugin-svelte", "setupFn": ["setupSvelte3", "setupSvelte4"] }, "commands": [{ "id": "histoire:plugin-svelte:generate-story", "label": "Generate Svelte 3 story from component", "icon": "https://svelte.dev/favicon.png", "searchText": "generate create", "clientSetupFile": "@histoire/plugin-svelte/dist/commands/generate-story.client.js" }] }], "outDir": "/home/max/Projects/nodes/packages/ui/.histoire/dist", "storyMatch": ["**/*.story.vue", "**/*.story.svelte"], "storyIgnored": ["**/node_modules/**", "**/dist/**"], "supportMatch": [{ "id": "vanilla", "patterns": ["**/*.js"], "pluginIds": ["vanilla"] }, { "id": "svelte", "patterns": ["**/*.svelte"], "pluginIds": ["svelte4"] }], "tree": { "file": "title", "order": "asc" }, "theme": { "title": "Histoire", "colors": { "primary": { "50": "#fff7ed", "100": "#ffedd5", "200": "#fed7aa", "300": "#fdba74", "400": "#fb923c", "500": "#f97316", "600": "#ea580c", "700": "#c2410c", "800": "#9a3412", "900": "#7c2d12" }, "gray": { "50": "#fafafa", "100": "#f4f4f5", "200": "#e4e4e7", "300": "#d4d4d8", "400": "#a1a1aa", "500": "#71717a", "600": "#52525b", "700": "#3f3f46", "750": "#323238", "800": "#27272a", "850": "#1f1f21", "900": "#18181b", "950": "#101012" } }, "defaultColorScheme": "auto", "storeColorScheme": true, "darkClass": "dark", "logo": { "square": "@histoire/plugin-svelte/assets/histoire-svelte.svg", "light": "@histoire/plugin-svelte/assets/histoire-svelte-text.svg", "dark": "@histoire/plugin-svelte/assets/histoire-svelte-text.svg" } }, "responsivePresets": [{ "label": "Mobile (Small)", "width": 320, "height": 560 }, { "label": "Mobile (Medium)", "width": 360, "height": 640 }, { "label": "Mobile (Large)", "width": 414, "height": 896 }, { "label": "Tablet", "width": 768, "height": 1024 }, { "label": "Laptop (Small)", "width": 1024, "height": null }, { "label": "Laptop (Large)", "width": 1366, "height": null }, { "label": "Desktop", "width": 1920, "height": null }, { "label": "4K", "width": 3840, "height": null }], "backgroundPresets": [{ "label": "Transparent", "color": "transparent", "contrastColor": "#333" }, { "label": "White", "color": "#fff", "contrastColor": "#333" }, { "label": "Light gray", "color": "#aaa", "contrastColor": "#000" }, { "label": "Dark gray", "color": "#333", "contrastColor": "#fff" }, { "label": "Black", "color": "#000", "contrastColor": "#eee" }], "sandboxDarkClass": "dark", "routerMode": "history", "build": { "excludeFromVendorsChunk": [] }, "viteIgnorePlugins": ["vite-plugin-sveltekit-compile"], "setupFile": "/src/histoire.setup.ts" };
const logos = { square: Logo_square, light: Logo_dark, dark: Logo_dark };
const histoireConfig = config;
const customLogos = logos;
const base = "/";
function createRouterHistory() {
  switch (histoireConfig.routerMode) {
    case "hash":
      return createWebHashHistory(base);
    case "history":
    default:
      return createWebHistory(base);
  }
}
const router = createRouter({
  history: createRouterHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => __vitePreload(() => import("./HomeView.vue-CcWnFK65.js"), true ? __vite__mapDeps([0,1,2]) : void 0)
    },
    {
      path: "/story/:storyId",
      name: "story",
      component: () => __vitePreload(() => import("./StoryView.vue-BFx-CBXY.js"), true ? __vite__mapDeps([3,2,1,4,5,6]) : void 0)
    }
  ]
});
const isDark = useDark({
  valueDark: "htw-dark",
  initialValue: histoireConfig.theme.defaultColorScheme,
  storageKey: "histoire-color-scheme",
  storage: histoireConfig.theme.storeColorScheme ? localStorage : sessionStorage
});
const toggleDark = useToggle(isDark);
function applyDarkToControls() {
  var _a;
  (_a = window.__hst_controls_dark) == null ? void 0 : _a.forEach((ref2) => {
    ref2.value = isDark.value;
  });
}
watch(isDark, () => {
  applyDarkToControls();
}, {
  immediate: true
});
window.__hst_controls_dark_ready = () => {
  applyDarkToControls();
};
const copiedFromExistingVariant = [
  "state",
  "slots",
  "source",
  "responsiveDisabled",
  "autoPropsDisabled",
  "setupApp",
  "configReady",
  "previewReady"
];
function mapFile(file2, existingFile) {
  let result;
  if (existingFile) {
    result = existingFile;
    for (const key in file2) {
      if (key === "story") {
        result.story = {
          ...result.story,
          ...file2.story,
          file: markRaw(result),
          variants: file2.story.variants.map((v) => mapVariant(v, existingFile.story.variants.find((item) => item.id === v.id)))
        };
      } else if (key !== "component") {
        result[key] = file2[key];
      }
    }
  } else {
    result = {
      ...file2,
      component: markRaw(file2.component),
      story: {
        ...file2.story,
        title: file2.story.title,
        file: markRaw(file2),
        variants: file2.story.variants.map((v) => mapVariant(v)),
        slots: () => ({})
      }
    };
  }
  return result;
}
function mapVariant(variant, existingVariant) {
  let result;
  if (existingVariant) {
    result = existingVariant;
    for (const key in variant) {
      if (!copiedFromExistingVariant.includes(key)) {
        result[key] = variant[key];
      }
    }
  } else {
    result = {
      ...variant,
      state: reactive({
        _hPropState: {},
        _hPropDefs: {}
      }),
      setupApp: null,
      slots: () => ({}),
      previewReady: false
    };
  }
  return result;
}
const clientSupportPlugins = {
  "vanilla": () => __vitePreload(() => import("./vendor-BCKkA27H.js").then((n) => n.b7), true ? [] : void 0),
  "svelte4": () => __vitePreload(() => import("./vendor-BCKkA27H.js").then((n) => n.b8), true ? [] : void 0)
};
const __default__ = {
  inheritAttrs: false
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  ...__default__,
  __name: "GenericMountStory",
  props: {
    story: {}
  },
  setup(__props) {
    const props = __props;
    const mountComponent = ref(null);
    watchEffect(async () => {
      var _a;
      const clientPlugin = clientSupportPlugins[(_a = props.story.file) == null ? void 0 : _a.supportPluginId];
      if (clientPlugin) {
        const pluginModule = await clientPlugin();
        mountComponent.value = markRaw(pluginModule.MountStory);
      }
    });
    return (_ctx, _cache) => {
      return mountComponent.value ? (openBlock(), createBlock(resolveDynamicComponent(mountComponent.value), mergeProps({
        key: 0,
        class: "histoire-generic-mount-story",
        story: _ctx.story
      }, _ctx.$attrs), null, 16, ["story"])) : createCommentVNode("", true);
    };
  }
});
export {
  __vitePreload as _,
  tree as a,
  _sfc_main as b,
  customLogos as c,
  clientSupportPlugins as d,
  base as e,
  files as f,
  histoireConfig as h,
  isDark as i,
  mapFile as m,
  router as r,
  toggleDark as t
};
