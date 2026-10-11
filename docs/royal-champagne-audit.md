# Royal Champagne reference implementation

Scope: the existing `royal-champagne-signature` theme, the shared studio's venue photo field and safe optional persisted field. Existing catalog entries, global marketing navigation/footer, public URL and guarded wedding APIs are retained.

## Source audit

- Buildless ES modules and Cloudflare Workers/D1; `src/weddings.js` already persists drafts, owner cookies, publication, uploads, music and private guests. No new database migration is required: venuePhoto is an additive field inside validated JSON.
- Existing theme used generic white palace artwork, duplicated hero/venue media, vector flowers and mismatched scene order.
- Opened primary/secondary art and both frame contact sheets. Primary has two opening states and nine scroll scenes. Video sequence shows independent paper folds and a central reveal. The original artwork, 3D source files and licensed recordings are not included in the package.

## Implemented

- Independent back, top, left, right and bottom folds, inner card, tactile seal and tassel; 3.1-second continuous opening with reduced-motion/skip/replay.
- Invitation letter, couple hall, details, venue, real countdown, horizontal touch gallery, secure RSVP, music, bilingual panel in reference order. Optional guestbook and guest uploads follow the flagship scenes when enabled.
- Reference-guided generated transparent florals and fictional palace/couple images, local licensed Great Vibes/Amiri, native gilded arch/embossing and paper grain.
- Separate persistent venue image and upload; secure existing editor/publication/RSVP flows retained.
- Five color controls, monogram presets, actual audio playback/volume synchronized with the floating player. Original synthesized Hijaz plucked-string/soft reed preview; production may upload a rights-cleared recording.

## Fidelity limits

Generated floral/photos are recreations and do not equal the original concept pixels. Native embossing and arch filigree approximate the artwork. The preview soundtrack is digitally synthesized, not a live oud recording. Source calendars use the configured real event timestamp, rather than the concept's internally inconsistent weekday/date.

No pixel-perfect claim is made. Real mobile Safari and Android device checks still require those devices.
