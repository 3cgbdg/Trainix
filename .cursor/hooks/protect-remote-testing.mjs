import process from "node:process";

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

let input = {};
try {
  input = raw.trim() ? JSON.parse(raw) : {};
} catch {
  process.stdout.write(JSON.stringify({ permission: "allow" }));
  process.exit(0);
}

const command = String(input.command ?? input.tool_input?.command ?? "");
const urls = command.match(/https?:\/\/[^\s'"`]+/gi) ?? [];
const hasRemoteUrl = urls.some((value) => {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host !== "localhost" && host !== "127.0.0.1" && host !== "::1";
  } catch {
    return false;
  }
});
const mutates = /(?:-X|--request|\b-Method)\s*(?:POST|PUT|PATCH|DELETE)\b/i.test(command);
const runsBrowserSuite = /(?:playwright\s+test|qa:e2e)/i.test(command);

if (hasRemoteUrl && (mutates || runsBrowserSuite)) {
  process.stdout.write(
    JSON.stringify({
      permission: "ask",
      user_message: "This QA command can mutate or automate a remote environment. Confirm that the target is an authorized test environment and that its data may be changed.",
      agent_message: "Use localhost or an explicitly authorized sandbox by default. Never run destructive QA automation against production without approval.",
    }),
  );
  process.exit(0);
}

process.stdout.write(JSON.stringify({ permission: "allow" }));
