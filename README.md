# The NerdyGent Press

A customizable newspaper studio and NerdyGent Lounge website. The product pitch is a paper without the fluff, shaped by the reader’s preferences and sources they choose. Create a reader profile, export prompts for an existing ChatGPT or Claude chat, import the resulting article JSON, inspect sources, and print or save a PDF from the browser.

## Development

Use Node 22.13 or later. Run `npm ci`, then `npm run dev`.

Checks: `npx tsc --noEmit`, `node --experimental-strip-types --test tests/*.test.mjs`, and `npm run build`. The pure TypeScript tests use Node 24. The production export is `dist/client`; `.openai/hosting.json` identifies the existing Sites project.

## Reader controls and review

`/studio` supports local/national/world coverage and emphasis, daily or weekly
editions, a searchable interest tree with per-niche weights and expiry, and
public sources with reader-assigned perspective labels and exclusions. These
choices are included in the free manual studio. A weekly day is a preference,
not an activated delivery schedule. The paid local companion remains planned.

`/review` is a mobile-friendly, explicit-feedback flow. Three net more/less
votes within 60 days suggest one rating point, with a maximum ±1 offset from
the manual rating. Suggestion-only is the default; automatic and off are
available. Undo recalculates. Style, repetition and source concerns never
lower topic weights. Reading and skipping are not training signals.

`lib/preferences.ts` holds the validated version 2 model; `lib/press.ts`
compiles prompts and audits imported editions. `lib/transfer.ts` validates
private backup/review files and rolls back failed multi-key storage writes.
The existing profile storage key migrates old profiles without changing their
ratings or cadence. Limits are 100 interests, 40 sources and 500 review records.

To review on another device, use Read & print → Take to my phone, transfer the
download yourself and open it on `/review`. Export reviews back to desktop
and choose **Merge reviews only** in the studio. Returned review packets carry
a stable profile ID, not a replacement profile. Full backup restoration is a
separate explicit action. Stale tabs cannot overwrite newer saved profiles.
Canonical source links deduplicate topic votes across editions. Undo records
survive older imports while retained among the latest 500 records. No automatic sync,
remote personal-paper hosting or secret-bearing feed links are implemented.

## Configuration and limits

`lib/brand.ts` contains the NerdyGent Lounge Discord invite. Reader information is saved only when the reader chooses to save it, in this browser's local storage. Generation uses manually copied prompts; there is no API integration, model billing, database, checkout or scheduler. Readers' chat plans have their own usage limits.

The browser importer validates article structure and dates, not factual truth. Readers must inspect the linked sources before printing. Browser pagination depends on paper size and print settings. The built-in sample contains original demonstration editorials, not current news or a private reader's newspaper.

The studio is a free public beta. It has no checkout or subscription activation. The $5/month companion is a pilot proposal, not on sale; wider reader trials and payment setup remain separate work.

`/connections` explains current manual use and the proposed ChatGPT plan connection. OpenAI token sharing is distinct from API-key billing. Paid/hosted eligibility and secure local integration remain unresolved; no sign-in, credential entry or token calls are enabled in this website.


## Public hosting

The interactive studio is published with Sites at
https://nerdygent-press.knightedheart.chatgpt.site/.
The GitHub Pages project guide is at
https://nerdygent.github.io/nerdygent-press/.

`github-pages/` contains a standalone, script-free guide and quick-start.
`.github/workflows/pages.yml` publishes only that folder when it changes on
`main`, or when manually dispatched. It does not upload the engine, reader
profiles, local editions, dependency directories or model credentials. The
interactive studio is hosted separately because GitHub Pages is intended for
project sites, not operating a commercial SaaS service. See
https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features#pages.

Repository: https://github.com/NerdyGent/nerdygent-press.
Only the standalone website checkout belongs here. Keep `../engine/`,
`../experiments/` and private reader data out of this public repository.
A GitHub push publishes guide changes automatically; app changes still need
validation and a Sites publication. The two publications are independent.

Visitors should start at `/help`. Bug reports are public and should use
fictional examples without private papers, profiles or feed credentials.


## Editorial design and product films

The October 2026 design uses a spacious software presentation, with newspaper
typography inside the edition. `app/press-design.css` provides layout and
`app/software-design.css` supplies the shared software theme. `components/press/`
contains the illustrative edition, adjustable preview controls and a tabbed
walkthrough gallery with accessible video players. Preview changes are temporary
and never write to a reader profile.
The homepage, plans and Lounge have new layouts; studio controls retain their
existing behavior.

Two original silent concept films in `public/films/` show local/RSS/Reddit source
selection and an interest adjustment into an edition. They are 12-second H.264
MP4s with poster frames, click-to-play controls and downloads. No autoplay,
tracking or video service is required. They demonstrate planned collection,
not live integrations. Reproduction instructions: `scripts/motion/README.md`.

Positioning: lead with reader control over sources, topics, perspectives, emphasis
and frequency. Keep profiles editable and feedback reversible. The product
promise is customization and relevance; avoid a lifestyle or trust-only pitch.
