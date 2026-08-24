import process from "node:process";

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

let input = {};
try {
  input = raw.trim() ? JSON.parse(raw) : {};
} catch {
  process.stdout.write("{}");
  process.exit(0);
}

const file = String(
  input.file_path ??
    input.filePath ??
    input.path ??
    input.tool_input?.file_path ??
    input.tool_input?.path ??
    "",
).replaceAll("\\", "/");

let command = "";
let skill = "qa-test-strategy";

if (/^backend\/(controllers|routes|middlewares|models|utils)\//.test(file)) {
  command = "npm run qa:api";
  skill = "qa-api-testing";
} else if (/^frontend\/(src|tests)\//.test(file)) {
  command = file.endsWith("tests/e2e/public-smoke.spec.ts")
    ? "npm run qa:e2e:smoke"
    : file.includes("tests/e2e/")
      ? "npm run qa:e2e"
      : "npm run qa:frontend";
  skill = file.includes("tests/e2e/") ? "qa-browser-testing" : "qa-test-strategy";
} else if (/^(frontend|backend)\/(package|tsconfig|jest|playwright)/.test(file)) {
  command = "npm run qa:types";
  skill = "qa-automation";
}

if (!command) {
  process.stdout.write("{}");
  process.exit(0);
}

process.stdout.write(
  JSON.stringify({
    additional_context: `QA impact: ${file} changed. Read .cursor/skills/${skill}/SKILL.md and run ${command} before claiming verification.`,
  }),
);
