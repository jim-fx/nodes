import type { GraphManager } from "./graph-manager";
import { create, type Delta } from "jsondiffpatch";
import type { Graph } from "./types";


const diff = create({
  objectHash: function (obj, index) {
    if (obj === null) return obj;
    if ("id" in obj) return obj.id;
    if (Array.isArray(obj)) {
      return obj.join("-")
    }
    return obj?.id || obj._id || '$$index:' + index;
  }
})

export class HistoryManager {

  index: number = -1;
  history: Delta[] = [];
  private initialState: Graph | undefined;
  private prevState: Graph | undefined;
  private timeout: number | undefined;

  private opts = {
    debounce: 400,
    maxHistory: 100,
  }


  constructor(private manager: GraphManager, { maxHistory = 100, debounce = 100 } = {}) {
    this.history = [];
    this.index = -1;
    this.opts.debounce = debounce;
    this.opts.maxHistory = maxHistory;
  }

  save() {
    if (!this.prevState) {
      this.prevState = this.manager.serialize();
      this.initialState = globalThis.structuredClone(this.prevState);
    } else {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.timeout = setTimeout(() => {
        const newState = this.manager.serialize();
        const delta = diff.diff(this.prevState, newState);
        if (delta) {
          // Add the delta to history
          if (this.index < this.history.length - 1) {
            // Clear the history after the current index if new changes are made
            this.history.splice(this.index + 1);
          }

          this.history.push(delta);
          this.index++;

          // Limit the size of the history
          if (this.history.length > this.opts.maxHistory) {
            this.history.shift();
          }
        }
        this.prevState = newState;
      }, this.opts.debounce) as unknown as number;
    }
  }

  undo() {
    if (this.index > 0) {
      const delta = this.history[this.index];
      const prevState = diff.unpatch(this.prevState, delta) as Graph;
      this.manager._init(prevState);
      this.index--;
      this.prevState = prevState;
    } else if (this.index === 0 && this.initialState) {
      this.manager._init(globalThis.structuredClone(this.initialState));
      console.log("Reached start", this.index, this.history.length)
    }
  }

  redo() {
    if (this.index < this.history.length - 1) {
      const nextIndex = this.index + 1;
      const delta = this.history[nextIndex];
      const nextState = diff.patch(this.prevState, delta) as Graph;
      this.manager._init(nextState);
      this.index = nextIndex;
      this.prevState = nextState;
    } else {
      console.log("Reached end")
    }
  }
}
