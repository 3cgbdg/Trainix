#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const manifest = JSON.parse(await readFile(resolve(root, ".qa-agent/manifest.json"), "utf8"));
assert.equal(manifest.schemaVersion, 1);
assert.equal(manifest.sourceRepository, "https://github.com/3cgbdg/qa-agent-kit");
assert.match(manifest.kitVersion, /^\d+\.\d+\.\d+$/u);

const digest = (content) => createHash("sha256").update(content).digest("hex");
const profile = await readFile(resolve(root, ".qa-agent/profile.json"), "utf8");
assert.equal(digest(profile), manifest.profileSha256, "project profile changed without regeneration");

for (const [path, expected] of Object.entries(manifest.files)) {
  const content = await readFile(resolve(root, path), "utf8");
  assert.equal(digest(content), expected, `${path} drifted from its generated manifest`);
  assert.ok(content.includes(`qa-agent-kit v${manifest.kitVersion}`), `${path} lacks its source marker`);
}

const skills = ["qa-test-strategy", "qa-api-testing", "qa-browser-testing", "qa-automation"];
for (const name of skills) {
  const cursor = await readFile(resolve(root, `.cursor/skills/${name}/SKILL.md`), "utf8");
  const claude = await readFile(resolve(root, `.claude/skills/${name}/SKILL.md`), "utf8");
  assert.equal(cursor, claude, `${name} differs between Cursor and Claude`);
  assert.match(cursor, new RegExp(`\\nname: ${name}\\n`, "u"));
}

for (const hook of [".cursor/hooks/qa-impact.mjs", ".claude/hooks/qa-impact.mjs"]) {
  const content = await readFile(resolve(root, hook), "utf8");
  for (const name of skills) assert.ok(content.includes(name), `${hook} omits ${name}`);
}

console.log(`Trainix QA agent valid: qa-agent-kit v${manifest.kitVersion}, ${Object.keys(manifest.files).length} generated files, 4 cross-platform skills.`);
