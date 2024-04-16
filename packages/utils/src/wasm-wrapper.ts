import { NodeType } from "@nodes/types";

const cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
const cachedTextEncoder = new TextEncoder();


const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
  ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
  }
  : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length
    };
  });

export function createWasmWrapper() {
  let wasm: any;




  let cachedUint8Memory0: Uint8Array | null = null;
  let cachedInt32Memory0: Int32Array | null = null;
  let cachedUint32Memory0: Uint32Array | null = null;

  const heap = new Array(128).fill(undefined);
  heap.push(undefined, null, true, false);
  let heap_next = heap.length;

  function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
      cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
  }

  function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
      cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
  }

  function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
      cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
  }

  function getStringFromWasm0(ptr: number, len: number) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
  }

  function getObject(idx: number) { return heap[idx]; }

  function addHeapObject(obj: any) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];
    heap[idx] = obj;
    return idx;
  }


  let WASM_VECTOR_LEN = 0;
  function passArray32ToWasm0(arg: ArrayLike<number>, malloc: (arg0: number, arg1: number) => number) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32Memory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
  }

  function getArrayI32FromWasm0(ptr: number, len: number) {
    ptr = ptr >>> 0;
    return getInt32Memory0().subarray(ptr / 4, ptr / 4 + len);
  }

  function dropObject(idx: number) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
  }

  function takeObject(idx: number) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
  }

  function getArrayJsValueFromWasm0(ptr: number, len: number) {
    ptr = ptr >>> 0;
    const mem = getUint32Memory0();
    const slice = mem.subarray(ptr / 4, ptr / 4 + len);
    const result = [];
    for (let i = 0; i < slice.length; i++) {
      result.push(takeObject(slice[i]));
    }
    return result;
  }

  function __wbindgen_string_new(arg0: number, arg1: number) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
  };

  // Additional methods and their internal helpers can also be refactored in a similar manner.
  function get_definition() {
    let deferred1_0: number;
    let deferred1_1: number;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.get_definition(retptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      const string = getStringFromWasm0(r0, r1);
      return JSON.parse(string) as Omit<NodeType, "id">;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }


  function execute(args: Int32Array) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passArray32ToWasm0(args, wasm.__wbindgen_malloc);
      const len0 = WASM_VECTOR_LEN;
      wasm.execute(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var v2 = getArrayI32FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 4, 4);
      return v2;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  function passStringToWasm0(arg: string, malloc: (arg0: any, arg1: number) => number, realloc: ((arg0: number, arg1: any, arg2: number, arg3: number) => number) | undefined) {

    if (realloc === undefined) {
      const buf = cachedTextEncoder.encode(arg);
      const ptr = malloc(buf.length, 1) >>> 0;
      getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
      WASM_VECTOR_LEN = buf.length;
      return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
      const code = arg.charCodeAt(offset);
      if (code > 0x7F) break;
      mem[ptr + offset] = code;
    }

    if (offset !== len) {
      if (offset !== 0) {
        arg = arg.slice(offset);
      }
      ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
      const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
      const ret = encodeString(arg, view);

      offset += ret.written;
      ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
  }

  function __wbg_new_abda76e883ba8a5f() {
    const ret = new Error();
    return addHeapObject(ret);
  };

  function __wbg_stack_658279fe44541cf6(arg0, arg1) {
    const ret = getObject(arg1).stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
  };

  function __wbg_error_f851667af71bcfc6(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
      deferred0_0 = arg0;
      deferred0_1 = arg1;
      console.error(getStringFromWasm0(arg0, arg1));
    } finally {
      wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
  };


  function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
  };

  function __wbg_log_5bb5f88f245d7762(arg0) {
    console.log(getObject(arg0));
  };

  function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };

  return {
    setInstance(instance: WebAssembly.Instance) {
      wasm = instance.exports;
    },

    // Expose other methods that interact with the wasm instance
    execute,
    get_definition,

    __wbindgen_string_new,
    __wbindgen_object_drop_ref,
    __wbg_new_abda76e883ba8a5f,
    __wbg_error_f851667af71bcfc6,
    __wbg_stack_658279fe44541cf6,
    __wbg_log_5bb5f88f245d7762,
    __wbindgen_throw,
  };
}

