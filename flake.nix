{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = {nixpkgs, ...}: let
    systems = ["aarch64-darwin" "x86_64-darwin" "aarch64-linux" "x86_64-linux"];
    eachSystem = function:
      nixpkgs.lib.genAttrs systems (system:
        function {
          inherit system;
          pkgs = nixpkgs.legacyPackages.${system};
        });
  in {
    devShells = eachSystem ({pkgs, ...}: {
      default = pkgs.mkShellNoCC {
        packages = [
          # general deps
          pkgs.nodejs_24
          pkgs.pnpm_10

          # wasm stuff
          pkgs.rustc
          pkgs.cargo
          pkgs.rust-analyzer
          pkgs.rustfmt
          pkgs.lld
          pkgs.zig
          pkgs.zls

          # frontend
          pkgs.vscode-langservers-extracted
          pkgs.typescript-language-server
          pkgs.prettier
          pkgs.tailwindcss-language-server
          pkgs.svelte-language-server
        ];

        shellHook = ''
          unset ZIG_GLOBAL_CACHE_DIR
        '';
      };
    });
  };
}
