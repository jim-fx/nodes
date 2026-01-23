const std = @import("std");

const def = @embedFile("input.json");

export fn execute(ptr: *anyopaque, len: c_int) c_int {
    _ = ptr; // autofix
    _ = len; // autofix
    return 0;
}

export fn __alloc(len: c_int) ?*anyopaque {
    if (len < 0) return null;
    const mem = std.heap.wasm_allocator.alloc(u8, @intCast(len)) catch return null;
    return mem.ptr;
}

export fn __free(ptr: *anyopaque, len: c_int) void {
    if (len < 1) return;
    const mem: [*]u8 = @ptrCast(@alignCast(ptr));
    std.heap.wasm_allocator.free(mem[0..@intCast(len)]);
}

export fn getDefinitionPtr() *const anyopaque {
    return def.ptr;
}

export fn getDefinitionLen() usize {
    return def.len;
}
