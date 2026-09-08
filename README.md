# The NerdyGent Press

A static personal newspaper studio and NerdyGent Lounge website. Create a reader profile, export prompts for an existing ChatGPT or Claude chat, import the resulting article JSON, inspect sources, and print or save a PDF from the browser.

## Development

Use Node 22.13 or later. Run `npm ci`, then `npm run dev`.

Checks: `npx tsc --noEmit`, `node --experimental-strip-types --test tests/press.test.mjs`, and `npm run build`. The pure TypeScript tests use Node 24. The production export is `dist/client`; `.openai/hosting.json` identifies the existing Sites project.

## Configuration and limits

`lib/brand.ts` contains the NerdyGent Lounge Discord invite. Reader information is saved only when the reader chooses to save it, in this browser's local storage. Generation uses manually copied prompts; there is no API integration, model billing, database, checkout or scheduler. Readers' chat plans have their own usage limits.

The browser importer validates article structure and dates, not factual truth. Readers must inspect the linked sources before printing. Browser pagination depends on paper size and print settings. The built-in sample contains original demonstration editorials, not current news or a private reader's newspaper.

The optional $19 supporter offer is proposed pricing with checkout disabled. Initial Sites publication is owner-private for review. Public release, real reader trials and payment setup remain separate steps.
