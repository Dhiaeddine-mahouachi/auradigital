#!/usr/bin/env node

import { spawn } from "node:child_process";
const args = process.argv.slice(2);
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

// AuraDigital has no R2 binding. Disabling Wrangler's beta automatic resource
// provisioning prevents an obsolete remote draft from recreating an R2 bucket.
if (args.includes("deploy")) {
  console.log("AuraDigital deploy: automatic resource provisioning disabled.");
}

const child = spawn(
  npmCommand,
  [
    "exec",
    "--yes",
    "--package=wrangler@4.120.1",
    "--",
    "wrangler",
    "--no-experimental-provision",
    ...args,
  ],
  {
    stdio: "inherit",
    env: process.env,
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(`Unable to start Cloudflare Wrangler: ${error.message}`);
  process.exit(1);
});
