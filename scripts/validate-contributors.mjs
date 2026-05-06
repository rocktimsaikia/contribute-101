#!/usr/bin/env node
import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const dataPath = resolve(root, "src/contributors.js");

const REQUIRED = [
  "name",
  "github_username",
  "favorite_coding_stack",
  "about_me",
  "location",
  "favorite_emoji",
];
const ALLOWED = new Set(REQUIRED);
// GitHub handles: alphanumeric + single hyphens, cannot start or end with hyphen,
// no consecutive hyphens, 1–39 characters.
const USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

let contributors;
try {
  ({ contributors } = await import(dataPath));
} catch (err) {
  console.error("Could not import src/contributors.js — file is invalid JavaScript.");
  console.error(err.message);
  process.exit(1);
}

if (!Array.isArray(contributors)) {
  console.error('src/contributors.js must export a "contributors" array.');
  process.exit(1);
}

// Build the set of usernames that already exist in the base ref.
// Anything missing from that set is treated as a NEW entry and gets strict checks
// (including a non-empty `about_me`); previously merged entries are grandfathered.
const baseFlagIdx = process.argv.indexOf("--base");
const base = baseFlagIdx !== -1 ? process.argv[baseFlagIdx + 1] : "origin/main";

let knownHandles = null;
try {
  const baseSource = execSync(`git show ${base}:src/contributors.js`, {
    encoding: "utf8",
    cwd: root,
    stdio: ["pipe", "pipe", "ignore"],
  });
  knownHandles = new Set();
  for (const m of baseSource.matchAll(/github_username:\s*"([^"]+)"/g)) {
    knownHandles.add(m[1].toLowerCase());
  }
  console.log(
    `Comparing against base "${base}" — ${knownHandles.size} known handles, ${contributors.length} on branch.`,
  );
} catch (_) {
  console.log(
    `Base ref "${base}" not available — treating every entry as new (strict mode).`,
  );
}

const isNew = (handle) => {
  if (knownHandles === null) return true;
  if (!handle || typeof handle !== "string") return true;
  return !knownHandles.has(handle.trim().toLowerCase());
};

const errors = [];
const warnings = [];
const seen = new Map();
let newCount = 0;

contributors.forEach((entry, idx) => {
  const tag = `entry #${idx + 1}${
    entry?.name
      ? ` (${entry.name})`
      : entry?.github_username
        ? ` (@${entry.github_username})`
        : ""
  }`;

  if (!entry || typeof entry !== "object") {
    errors.push(`${tag}: must be an object`);
    return;
  }

  const isNewEntry = isNew(entry.github_username);
  if (isNewEntry) newCount++;

  // Presence is enforced strictly for new entries only; entries that already
  // exist on the base ref are grandfathered (they may pre-date a field).
  if (isNewEntry) {
    for (const field of REQUIRED) {
      if (!(field in entry)) {
        errors.push(`${tag}: missing required field "${field}"`);
      }
    }
  }

  if (typeof entry.name !== "string" || entry.name.trim() === "") {
    errors.push(`${tag}: "name" must be a non-empty string`);
  }

  if (typeof entry.github_username !== "string" || entry.github_username.trim() === "") {
    errors.push(`${tag}: "github_username" must be a non-empty string`);
  } else {
    const handle = entry.github_username.trim();
    if (!USERNAME_RE.test(handle)) {
      const msg = `${tag}: "github_username" "${handle}" is not a valid GitHub handle (letters, digits, hyphens; max 39 chars; no leading/trailing hyphen)`;
      (isNewEntry ? errors : warnings).push(msg);
    }
    const lower = handle.toLowerCase();
    if (seen.has(lower)) {
      const prev = seen.get(lower);
      const msg = `${tag}: duplicate github_username "${handle}" — already used at entry #${prev.idx + 1}`;
      // A duplicate is only a hard error when at least one side is new in this PR
      (isNewEntry || prev.isNew ? errors : warnings).push(msg);
    } else {
      seen.set(lower, { idx, isNew: isNewEntry });
    }
  }

  if (
    !Array.isArray(entry.favorite_coding_stack) ||
    entry.favorite_coding_stack.length === 0
  ) {
    errors.push(`${tag}: "favorite_coding_stack" must be a non-empty array of strings`);
  } else {
    entry.favorite_coding_stack.forEach((tech, i) => {
      if (typeof tech !== "string" || tech.trim() === "") {
        errors.push(`${tag}: favorite_coding_stack[${i}] must be a non-empty string`);
      }
    });
  }

  if (typeof entry.about_me !== "string") {
    errors.push(`${tag}: "about_me" must be a string`);
  } else if (entry.about_me.trim() === "" && isNewEntry) {
    errors.push(
      `${tag}: "about_me" must be a non-empty string — please share a short bio about yourself`,
    );
  }

  if ("location" in entry) {
    if (typeof entry.location !== "string") {
      errors.push(`${tag}: "location" must be a string`);
    } else if (entry.location.trim() === "" && isNewEntry) {
      errors.push(`${tag}: "location" must be a non-empty string (e.g. "City, Country")`);
    }
  }

  if ("favorite_emoji" in entry) {
    if (typeof entry.favorite_emoji !== "string") {
      errors.push(`${tag}: "favorite_emoji" must be a string`);
    } else if (entry.favorite_emoji.trim() === "" && isNewEntry) {
      errors.push(`${tag}: "favorite_emoji" must be a non-empty string (e.g. "🚀")`);
    }
  }

  for (const key of Object.keys(entry)) {
    if (!ALLOWED.has(key)) {
      warnings.push(
        `${tag}: unknown field "${key}" — allowed fields are: ${[...ALLOWED].join(", ")}`,
      );
    }
  }
});

console.log(
  `Checked ${contributors.length} contributors (${newCount} new in this branch).`,
);

if (warnings.length > 0) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`  - ${w}`);
}

if (errors.length > 0) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error(
    "\nPlease fix the above before this PR can be merged. " +
      "See README.md for the contributor entry format.",
  );
  process.exit(1);
}

console.log("All entries are valid.");
