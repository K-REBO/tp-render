import esbuild from "esbuild";
import builtins from "builtin-modules";
import path from "path";
import fs from "fs";

// Templaterと同じwasmPlugin（"embed"モードでWASMバイナリをインライン化）
const wasmPlugin = (config) => {
    return {
        name: "wasm",
        setup(build) {
            build.onResolve({ filter: /\.wasm$/ }, (args) => {
                if (args.resolveDir === "") return;
                return {
                    path: path.isAbsolute(args.path)
                        ? args.path
                        : path.join(args.resolveDir, args.path),
                    namespace: `wasm-${config.mode}`,
                };
            });
            build.onLoad(
                { filter: /.*/, namespace: "wasm-embed" },
                async (args) => ({
                    contents: await fs.promises.readFile(args.path),
                    loader: "binary",
                })
            );
        },
    };
};

await esbuild
    .build({
        entryPoints: ["src/cli/index.ts"],
        bundle: true,
        platform: "node",
        format: "cjs",
        target: "node18",
        outfile: "dist/cli.js",
        banner: { js: "#!/usr/bin/env node" },
        plugins: [wasmPlugin({ mode: "embed" })],
        external: [...builtins],
        logLevel: "info",
        treeShaking: true,
    })
    .catch(() => process.exit(1));
