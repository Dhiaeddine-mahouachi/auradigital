#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const realWrangler = require.resolve("cloudflare-wrangler");
const args = process.argv.slice(2);

// AuraDigital has no R2 binding. Disabling Wrangler's beta automatic resource
// provisioning prevents an obsolete remote draft from recreating an R2 bucket.
const child = spawn(
  process.execPath,
  ["--no-warnings", realWrangler, "--no-experimental-provision", ...args],
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
