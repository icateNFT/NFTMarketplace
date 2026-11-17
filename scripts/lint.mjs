/* `npm run lint` — ESLint with Next.js's rules (eslint.config.mjs).

   ESLint and eslint-config-next bring in about 300 packages, none of which the
   site needs to run or build (Next.js 16's `next build` no longer lints). So they
   are not in package.json: the first lint installs them, without saving them, at
   the versions below. `npm install` / `npm ci` removes them again; the next lint
   puts them back.

   Usage:  npm run lint
           npm run lint -- --fix src/app */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const TOOLS = ["eslint@9.39.5", "eslint-config-next@16.3.4"];

const ROOT = process.cwd();
const installed = (name) => existsSync(path.join(ROOT, "node_modules", name, "package.json"));

/* npm sets npm_execpath when it runs a script; calling it through node works on every OS */
const npm = (args) =>
  process.env.npm_execpath
    ? spawnSync(process.execPath, [process.env.npm_execpath, ...args], { stdio: "inherit", cwd: ROOT })
    : spawnSync("npm", args, { stdio: "inherit", cwd: ROOT, shell: process.platform === "win32" });

if (!TOOLS.every((t) => installed(t.slice(0, t.lastIndexOf("@"))))) {
  console.log(`\x1b[36m[cadastra]\x1b[0m Installing the linter for this run (${TOOLS.join(", ")})…`);
  const r = npm(["install", "--no-save", "--no-audit", "--no-fund", ...TOOLS]);
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const r = spawnSync(process.execPath, [path.join(ROOT, "node_modules", "eslint", "bin", "eslint.js"), ...process.argv.slice(2)], {
  stdio: "inherit",
  cwd: ROOT,
});
process.exit(r.status ?? 1);
