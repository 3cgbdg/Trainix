import process from "node:process";

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

let input = {};
try {
  input = raw.trim() ? JSON.parse(raw) : {};
} catch {
  process.exit(0);
}

const command = String(input.tool_input?.command ?? input.command ?? "");
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

if (!hasRemoteUrl || (!mutates && !runsBrowserSuite)) process.exit(0);

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "ask",
    permissionDecisionReason: "This QA command can mutate or automate a remote environment. Confirm that it is an authorized test target whose data may be changed.",
    additionalContext: "Default QA automation to localhost or an explicitly authorized sandbox; never mutate production without approval.",
  },
}));
