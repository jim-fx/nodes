const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.resolveTargetQuery(.{ .os_tag = .freestanding, .abi = .none, .cpu_arch = .wasm32 });
    const release = b.option(bool, "release", "To build a wasm release") orelse false;

    const exe = b.addExecutable(.{
        .name = "math",
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/main.zig"),
            .target = target,
            .optimize = if (release) .ReleaseSmall else .Debug,
        }),
    });
    exe.rdynamic = true;
    exe.entry = .disabled;

    b.installArtifact(exe);
}
