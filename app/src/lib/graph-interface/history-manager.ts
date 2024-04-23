import { create, type Delta } from "jsondiffpatch";
import type { Graph } from "@nodes/types";
import { createLogger, clone } from "./helpers/index.js";


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

const log = createLogger("history")
log.mute();

export class HistoryManager {

  index: number = -1;
  history: Delta[] = [];
  private initialState: Graph | undefined;
  private state: Graph | undefined;

  private opts = {
    debounce: 400,
    maxHistory: 100,
  }

  constructor({ maxHistory = 100, debounce = 100 } = {}) {
    this.history = [];
    this.index = -1;
    this.opts.debounce = debounce;
    this.opts.maxHistory = maxHistory;
    globalThis["_history"] = this;
  }

  save(state: Graph) {
    if (!this.state) {
      this.state = clone(state);
      this.initialState = this.state;
      log.log("initial state saved")
    } else {
      const newState = state;
      const delta = diff.diff(this.state, newState);
      if (delta) {
        log.log("saving state")
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
        this.state = newState;
      } else {
        log.log("no changes")
      }
    }
  }

  reset() {
    this.history = [];
    this.index = -1;
    this.state = undefined;
    this.initialState = undefined;
  }

  undo() {
    if (this.index === -1 && this.initialState) {
      log.log("reached start, loading initial state")
      return clone(this.initialState);
    } else {
      const delta = this.history[this.index];
      const prevState = diff.unpatch(this.state, delta) as Graph;
      this.state = prevState;
      this.index = Math.max(-1, this.index - 1);
      return clone(prevState);
    }
  }

  redo() {
    if (this.index <= this.history.length - 1) {
      const nextIndex = Math.min(this.history.length - 1, this.index + 1);
      const delta = this.history[nextIndex];
      const nextState = diff.patch(this.state, delta) as Graph;
      this.index = nextIndex;
      this.state = nextState;
      return clone(nextState);
    } else {
      log.log("reached end")
    }
  }
}
