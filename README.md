# The NerdyGent Press

A static personal newspaper studio and NerdyGent Lounge website. Create a reader profile, export prompts for an existing ChatGPT or Claude chat, import the resulting article JSON, inspect sources, and print or save a PDF from the browser.

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
and import/save them in the studio. This replaces the adopted profile and
review history; back up separately edited devices first. No automatic sync,
remote personal-paper hosting or secret-bearing feed links are implemented.

## Configuration and limits

`lib/brand.ts` contains the NerdyGent Lounge Discord invite. Reader information is saved only when the reader chooses to save it, in this browser's local storage. Generation uses manually copied prompts; there is no API integration, model billing, database, checkout or scheduler. Readers' chat plans have their own usage limits.

The browser importer validates article structure and dates, not factual truth. Readers must inspect the linked sources before printing. Browser pagination depends on paper size and print settings. The built-in sample contains original demonstration editorials, not current news or a private reader's newspaper.

The optional $19 supporter offer is proposed pricing with checkout disabled. Initial Sites publication is owner-private for review. Public release, real reader trials and payment setup remain separate steps.
