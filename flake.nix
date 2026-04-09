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
          npmDepsHash = "sha256-Tsk736xf65r8xgrgPmXXDQ2tuEAmZmYHNHCAPbs3cJo=";
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
