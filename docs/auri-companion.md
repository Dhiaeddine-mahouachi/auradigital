# Auri in the Business Hub

Auri uses the existing Hub account, workspace, roadmap and guidance endpoints. The Hub
animates Auri during a real request and only signals success when the server responds.
The guided questionnaire uses the Hub's existing roadmap rules. The guidance endpoint
uses the existing scoped model integration where `HUB_AURI_AI_ENABLED=true` is configured
and falls back to rules when the model is disabled or unavailable. Read aloud uses the
device's speech synthesis and starts only when clicked.

## Character and Spline

`media/auri/auri.glb` is the master model with separate pivots for the helmet assembly,
eyes and arms, plus modular body, equipment and hover parts. The model was built from the
Auri evolution reference using Blender. Open Spline's **Open / Import** dialog or drag
the GLB into the scene. See [Spline's import documentation](https://docs.spline.design/importing-content/how-to-import-content).

The GLB imports meshes and materials. Levels and motion are applied by the Hub runtime.
Use groups named Torso, Feet, Legs, Arms, Antenna, BuilderKit, OperatorKit,
StrategistKit and MasterKit to configure the seven appearances in Spline.

To rebuild the model and posters, run `blender -b -P scripts/build-auri-model.py` from
the repository root, then convert `/tmp/auri-level-{1..7}.png` to same-named WebPs in
`media/auri/` with WebP quality 84. `npm run build:hub` compiles the Hub and lazy Three.js viewer.
Posters are used on data-saving connections and when WebGL is unavailable. WebGL pauses
offscreen, in hidden tabs and after a minute of inactivity. The viewer also observes the
device's reduced-motion preference.

## Verification and progression

Level 1 is shown before the roadmap exists. Saving the first roadmap unlocks level 2.
Each distinct, verified business capability unlocks one further level, up to level 7.
Changing a task to Done updates the roadmap, while verified progress comes from D1.

An authenticated AuraDigital owner or manager can verify a milestone via
`POST /api/admin/workspace/auri-milestones` from the same origin. Send the workspace's
`organizationId`, an `outcome` below, and an `evidenceRef` pointing to an internal
record the operator has checked. Use opaque references with letters, digits, underscores,
periods, hyphens or colons. Do not include customer details. The same verification can be
retried safely. The Hub displays only the total and level.

| Outcome | Example evidence |
| --- | --- |
| `foundation` | Public business contact details or a functioning booking channel |
| `visibility` | Published listing, live site or catalog, or an active referral channel |
| `conversion` | Verified booking, sale or qualified lead through a tracked workflow |
| `operations` | A repeatable follow-up, order or handoff process in use |
| `measurement` | A reviewed business metric and a documented decision based on it |

Evidence can come from the customer's current tools or manual business processes.
The next Hub refresh updates the stage. If the workspace is already open, reloading it
through its normal interaction shows the evolution or milestone animation.

## Release

1. Run `npm run check`, `npm test`, and `npm run deploy:check`.
2. Start the local in-memory fixture with `PORT=4173 node scripts/dev-hub.mjs` and run
   `node scripts/test-hub-browser.mjs` with Chromium installed.
3. Apply D1 migration `0030_auri_milestones.sql` to the production database using the
   project's authorized Cloudflare workflow before enabling the new Worker build.
   The migration creates a new table and does not backfill or modify customer records.
4. Merge through the established GitHub workflow. Confirm the Cloudflare production
   deployment and smoke-test `/hub`, the same-origin assets, and the workspace API.
