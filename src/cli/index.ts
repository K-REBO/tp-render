import { readFileSync, writeFileSync } from "fs";
import * as path from "path";
import { Parser } from "./parser";
import {
    generate_now,
    generate_tomorrow,
    generate_weekday,
    generate_yesterday,
} from "./date";

// WASMは常に async function anonymous(tp) { ... } を生成し、
// コンテキスト全体を tp パラメータとして渡す。
// テンプレートは tp.date.now() のようにアクセスするため、
// コンテキストは tp ラッパーなしのフラット構造にする。
function buildContext(notePath: string): Record<string, unknown> {
    const title = path.basename(notePath, path.extname(notePath));
    return {
        date: {
            now: generate_now(),
            tomorrow: generate_tomorrow(),
            weekday: generate_weekday(),
            yesterday: generate_yesterday(),
        },
        file: {
            title,
            path: notePath,
        },
    };
}

function printUsage() {
    console.error(
        "Usage: tp-render <template-file> [--title=<note-title>] [--output=<output-file>]"
    );
    console.error("");
    console.error("  <template-file>   Templater形式のテンプレートファイル");
    console.error("  --title=<title>   ノートのタイトル（tp.file.titleに使用）");
    console.error("  --output=<file>   出力先ファイル（省略時はstdout）");
}

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
        printUsage();
        process.exit(args.length === 0 ? 1 : 0);
    }

    const templatePath = args[0];
    const titleArg = args
        .find((a) => a.startsWith("--title="))
        ?.slice("--title=".length);
    const outputArg = args
        .find((a) => a.startsWith("--output="))
        ?.slice("--output=".length);

    let content: string;
    try {
        content = readFileSync(templatePath, "utf-8");
    } catch (err) {
        console.error(`Error: テンプレートファイルを読み込めません: ${templatePath}`);
        process.exit(1);
    }

    // tp.file.title に使うノートのパスを決定
    const notePath = titleArg
        ? titleArg.endsWith(".md")
            ? titleArg
            : `${titleArg}.md`
        : `${new Date().toISOString().split("T")[0]}.md`;

    const parser = new Parser();
    await parser.init();

    const context = buildContext(notePath);
    const result = await parser.parse_commands(content, context);

    if (outputArg) {
        writeFileSync(outputArg, result, "utf-8");
    } else {
        process.stdout.write(result);
    }
}

main().catch((err) => {
    console.error("Error:", err.message ?? err);
    process.exit(1);
});
