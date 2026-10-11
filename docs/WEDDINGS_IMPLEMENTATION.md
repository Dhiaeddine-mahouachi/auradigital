# AuraWeddings Signature Collection — implementation record

Repository: Dhiaeddine-mahouachi/auradigital
Branch: feat/auraweddings-signature-collection

## Implemented

- Additive 25-design collection, keeping all original 50 catalog entries and their URLs.
- Original generated architectural artwork per theme, optimized WebP/mobile/thumbnail variants, and editable CSS stationery.
- 23 opening families with theme variations: envelope, doors, pressed florals, book, arch, scroll, ribbon, lantern, sleeve, bloom, mosaic, constellation, pearl, jasmine, brocade, wax, geometric panels, letter, box, leaves, film and crescent; gold-book is separately styled.
- Eleven page composition families with per-theme art, typography, ornaments and palette; shared guest primitives remain reusable.
- Opening sequence with skip, replay, remembered published state, keyboard focus handling and reduced-motion fallback.
- Arabic/English guest layouts, locally hosted OFL Amiri font, editable Arabic wording presets.
- Product hero opening demo, filtered signature gallery, separate Classic Collection, original corporate header/footer, factual FAQ and inquiry flow.
- Studio: live preview, device-width selector, draft saving, publication, section ordering/visibility, undo/redo, names, wording, local timezone, event schedule, venue coordinates, images, image focal points, audio and sharing.
- Durable Cloudflare D1 tables created additively on first use; no existing production tables or rows altered.
- Owner capability cookie (256-bit random secret, hash stored in D1, HttpOnly, Secure, SameSite=Strict), plus existing AuraDigital owner/manager admin authentication.
- Published guest access, optional personal-token protection and per-guest limits; private links default noindex and no-referrer.
- RSVP upsert prevents repeat responses from the same browser or personal guest link; owner-only response list and CSV export with formula protection.
- Guestbook and guest photo moderation; owner approve/reject/delete.
- Image uploads validate byte signatures and MIME type; client resizes decoded photos; 768 KiB stored image limit and 100 guest images per invitation.
- Authorized MP3/Ogg/WAV uploads up to 10 MiB; chunked D1 storage and byte-range streaming; 3 recordings per invitation.
- Scoped origin checks, existing perimeter rate limiter plus application write limits, bounded bodies and parameterized SQL.
- QR generation uses locally vendored MIT qrcode-generator. Public and personal guest links can produce a QR.
- Invitation deletion removes its guest/media/audio records; administrative mutation audit records are written.
- Wrangler safe wrapper updated to resolve the officially exported package.json path while retaining disabled automatic resource provisioning.

## Audio and artwork provenance

All 25 architectural scenes were newly generated with the built-in image generation tool for this project on 2026-10-11. They do not depict recognizable people and must not be presented as photographs of actual customer venues. Each theme manifest records its art files and source status. CSS stationery and SVG decorative artwork were authored for this repository.

No commercial Arabic recording is bundled. The demo sound is an original procedural sine-tone ambient preview, explicitly identified as a preview, not a recording of oud/zaffa/malouf. Suggested music moods are metadata. Customers can upload or link authorized recordings and must attest to their rights. Authorization assertions are stored; licenses are not independently verified. Music starts only after a play action.

Amiri is distributed with its SIL Open Font License. The vendored QR encoder contains its MIT copyright notice and license text in vendor/LICENSE.txt.

## Verification and limits

Automated Node/SQLite API integration tests cover draft/save/publish, guest access, RSVP updates, moderation, deletion, file signatures, audio chunks/ranges, CSV safety, timezone conversion and DST edge cases. These tests exercise real SQLite persistence within test databases; they do not use the production database. Existing repository tests are preserved.

All 52 Node tests pass. JavaScript syntax checks, balanced HTML integration checks and the Cloudflare Worker deploy dry run pass. The dry run uses the existing DB and routes and does not provision new resources.

Browser QA is NOT complete. Playwright is installed in the execution runtime but no Chromium executable is present. The supplied `npm run test:weddings:browser` suite stops at browser launch because the Chromium executable is missing. No screenshots, visual regression run, iPhone/Android browser validation, Lighthouse measurements or interaction performance benchmarks are claimed. Generated artwork contact sheets are art inspection, not screenshots of working pages.

Known remaining scope:

- Full browser/visual/accessibility QA and performance measurement before claiming the requested production-quality acceptance criteria.
- Customer account login/recovery: initial ownership is browser capability based, with existing admin assistance. Losing the cookie loses customer access.
- Existing Classic Collection retains its earlier preview/inquiry editor; durable editing/publishing is currently for Signature designs only.
- Theme-specific compositions use 11 shared layout families, not 25 fully bespoke structural implementations.
- No real hand-held envelope film or complex physically simulated paper; CSS 3D stationery provides the opening.
- No licensed commercial Arabic music catalog, music-track administration catalog or audio mastering.
- No guestbook likes, uploaded guest video, video gallery editor or interactive embedded map; real coordinates generate Google Maps directions.
- Theme visibility administration, expiry/archive automation, customer payments, permission audit viewer and retention policies are not yet implemented.
- Signature studio controls use English labels with Arabic name/wording fields; complete Arabic studio/product localization remains to be finished. Guest invitation controls are Arabic/English.
- QR/WhatsApp shares require customer use of the correct personal link for private invitations.
- Published invitations do not yet have dynamic server-rendered social preview metadata.

## Deployment

Deployment uses main -> existing sync workflow -> contact-autoreply -> the existing Cloudflare integration. Actual publication status must be verified independently; a successful dry run is not a production deployment.

## Theme routes and opening designs

| Design | Live demo route | Opening | Music status |
| --- | --- | --- | --- |
| Obsidian Royal | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=obsidian-royal) | envelope — Black embossed paper · geometric gold lining | Romantic oud & piano suggested; authorized recording required |
| Burgundy Royal Palace | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=burgundy-royal-palace) | doors — Royal panels · ruby velvet · palace arch | Gulf zaffa suggested; authorized recording required |
| Ivory Botanical | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=ivory-botanical) | pressed — Pressed flowers · embossed botanical seal | Oud & strings suggested; authorized recording required |
| Emerald Heirloom | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=emerald-heirloom) | book — Embossed cover · illustrated heirloom pages | Oud & qanun suggested; authorized recording required |
| Modern Islamic Arch | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=modern-islamic-arch) | arch — An illuminated arch · sculptural stationery | Peaceful ney & oud suggested; authorized recording required |
| Desert Heritage | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=desert-heritage) | scroll — Parchment unfolds · desert copper | Arabic heritage suggested; authorized recording required |
| Mediterranean Sunset | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=mediterranean-sunset) | ribbon — Silk ribbon · seaside sunset letter | Piano & strings suggested; authorized recording required |
| Midnight Lantern Garden | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=midnight-lantern-garden) | lantern — A lantern illuminates a folded letter | Oud & strings suggested; authorized recording required |
| Champagne Minimalist | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=champagne-minimalist) | slide — Monogrammed sleeve · quiet typography | Minimal piano suggested; authorized recording required |
| Rose Garden Dream | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=rose-garden-dream) | bloom — Petals unfold · a watercolor love letter | Arabic romance suggested; authorized recording required |
| Moroccan Zellige | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=moroccan-zellige) | tiles — A mosaic envelope unfolds tile by tile | Moroccan wedding suggested; authorized recording required |
| Ottoman Tulip | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=ottoman-tulip) | book — Illuminated manuscript · imperial tulips | Turkish classical suggested; authorized recording required |
| Andalusian Courtyard | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=andalusian-courtyard) | scroll — A scroll beneath a Moorish arch | Andalusian suggested; authorized recording required |
| Celestial Arabian Night | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=celestial-arabian-night) | constellation — Constellations reveal your monogram | Cinematic Arabic suggested; authorized recording required |
| Pearl of the Gulf | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=pearl-of-the-gulf) | pearl — A pearl clasp releases a silk letter | Gulf romance suggested; authorized recording required |
| Sidi Bou Said Romance | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=sidi-bou-said-romance) | jasmine — Jasmine ornament · Tunisian blue doors | Tunisian malouf suggested; authorized recording required |
| Damascus Heritage | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=damascus-heritage) | brocade — Brocade paper · carved-wood ornament | Oud & qanun suggested; authorized recording required |
| Parisian Classic | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=parisian-classic) | wax — Handwritten stationery · classic wax seal | Minimal piano suggested; authorized recording required |
| Art Deco Grandeur | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=art-deco-grandeur) | geometric — Symmetrical geometric panels · platinum | Cinematic Arabic suggested; authorized recording required |
| Vintage Love Letter | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=vintage-love-letter) | letter — An aged letter · handwritten memories | Nostalgic oud & violin suggested; authorized recording required |
| White Palace | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=white-palace) | box — A keepsake box unfolds layered cards | Arabic orchestral suggested; authorized recording required |
| Forest Fairytale | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=forest-fairytale) | leaves — Leaf shadows · forest paper · fireflies | Peaceful ney & oud suggested; authorized recording required |
| Black and White Cinema | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=black-white-cinema) | film — Stationery becomes a cinematic title frame | Cinematic Arabic suggested; authorized recording required |
| Golden Majlis | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=golden-majlis) | gold-book — Gold foil book · warm ceremonial light | Festive Arabic wedding suggested; authorized recording required |
| Enchanted Moonlight | [Preview](https://auradigitalworks.com/weddings/signature.html?theme=enchanted-moonlight) | crescent — A crescent releases a moonlit letter | Arabic romance suggested; authorized recording required |

Landing: https://auradigitalworks.com/aura-weddings

Gallery: https://auradigitalworks.com/aura-weddings#signature

Studio: https://auradigitalworks.com/weddings/studio.html
