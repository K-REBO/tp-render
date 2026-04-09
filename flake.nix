{
  description = "CLI for rendering Obsidian Templater templates";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        tp-render = pkgs.buildNpmPackage {
          pname = "tp-render";
          version = "0.1.0";
          src = ./.;
          # `nix build` 後に `nix hash path ./node_modules` で更新する
          npmDepsHash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
          buildPhase = ''
            npm run build
          '';
          installPhase = ''
            mkdir -p $out/bin
            install -m755 dist/cli.js $out/bin/tp-render
          '';
        };
      in {
        packages.default = tp-render;

        overlays.default = final: prev: {
          tp-render = tp-render;
        };
      }
    );
}
