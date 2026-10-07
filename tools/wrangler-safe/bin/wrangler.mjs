#!/usr/bin/env node

import { spawn } from "node:child_process";
const args = process.argv.slice(2);
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
const require = createRequire(import.meta.url);
const wranglerEntry = join(dirname(require.resolve("wrangler-cli/package.json")), "bin/wrangler.js");

// AuraDigital has no R2 binding. Disabling Wrangler's beta automatic resource
// provisioning prevents an obsolete remote draft from recreating an R2 bucket.
if (args.includes("deploy")) {
  console.log("AuraDigital deploy: automatic resource provisioning disabled.");
}

const child = spawn(
  process.execPath,
  [
    wranglerEntry,
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
