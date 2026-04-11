# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A custom shadcn component registry built on the shadcn registry template. Components authored here are published as static JSON under `public/r/*.json`, which the `shadcn` CLI consumes when users run `shadcn add` against this registry. The Next.js app itself is a gallery that previews the registered components and wires up "Open in v0" links.

Stack: Next.js 15 (App Router, Turbopack), React 19, Tailwind CSS v4, TypeScript, pnpm.

## Commands

```bash
pnpm dev              # next dev --turbopack — runs the preview gallery
pnpm build            # next build
pnpm lint             # next lint (ESLint 9 + eslint-config-next)
pnpm registry:build   # shadcn build — compiles registry.json → public/r/*.json
```

There is no test runner configured in this repo.

`NEXT_PUBLIC_BASE_URL` must be set for the "Open in v0" button to produce a working URL — it embeds `${NEXT_PUBLIC_BASE_URL}/r/<name>.json` into the v0 deeplink (see [components/open-in-v0-button.tsx:19](components/open-in-v0-button.tsx#L19)).

## Design decisions log

[DESIGN_DECISIONS.md](DESIGN_DECISIONS.md) is a running record of architectural and product decisions. After any non-trivial decision — a new component's architecture, a distribution/dependency tradeoff, a deferred feature, a rejected approach worth remembering — append a new entry at the top of the file (reverse chronological) before considering the task done.

Each entry should include: date, decision, context, options considered, why we picked what we did, and what's still open. Keep entries tight — this is a log, not documentation. If a later decision overrides an earlier one, add a new entry that references the old one rather than editing history.

## Architecture

There are two parallel consumers of the code under [registry/](registry/) and you must keep both in mind when editing:

1. **The shadcn CLI (external consumers).** [registry.json](registry.json) is the authoritative manifest: each `items[]` entry lists a component's `name`, `dependencies` (npm deps), and `files[]` (source paths to bundle). `pnpm registry:build` reads this file and emits one JSON per item into [public/r/](public/r/) — e.g. `public/r/input-otp.json`. Those JSONs are what `shadcn add` downloads. **After changing any file listed in `registry.json` or the manifest itself, re-run `pnpm registry:build`** or `public/r/*.json` will be stale relative to the source.

2. **The local preview gallery.** [app/page.tsx](app/page.tsx) imports block components directly from `@/registry/new-york/blocks/...` (not through the published JSON), so the dev server reflects source edits immediately without a registry rebuild. When adding a new block to the gallery, import it from its source path and pair it with `<OpenInV0Button name="<registry-item-name>" />`.

### Directory roles

- [registry/new-york/blocks/](registry/new-york/blocks/) — components distributed through the registry. These are what `registry.json` points at. A block can be a single `.tsx` file (e.g. [input.tsx](registry/new-york/blocks/input.tsx)) or a folder of related files (e.g. [input-otp/](registry/new-york/blocks/input-otp/)); match the folder structure to the paths declared in `registry.json`.
- [registry/new-york/ui/](registry/new-york/ui/) — shadcn primitives (button, card, input, label, textarea) used *internally* by the gallery app itself. These are **not** currently published through `registry.json`; treat them as local app dependencies.
- [components/](components/) — app-only components (e.g. `OpenInV0Button`) that are not distributed.
- [lib/utils.ts](lib/utils.ts) — `cn()` helper. Path alias `@/lib/utils` is the shadcn convention; preserve it in block source so generated JSON resolves correctly on consumers.
- [public/r/](public/r/) — **generated output**. Do not hand-edit; regenerate via `pnpm registry:build`.

### Style / conventions baked into the template

- `components.json` declares `style: "new-york"`, `baseColor: "neutral"`, Tailwind v4 with CSS variables, `rsc: true`, and the `@/` aliases (`components`, `ui`, `lib`, `utils`, `hooks`). New blocks should import via these aliases.
- Existing blocks (see [registry/new-york/blocks/input.tsx](registry/new-york/blocks/input.tsx)) export a `cva`-based `*Variants` alongside the component so consumers can compose styles — follow that pattern when adding variants.

## Adding a new registry item

1. Drop the source under `registry/new-york/blocks/<name>.tsx` or `registry/new-york/blocks/<name>/...`.
2. Add an `items[]` entry to [registry.json](registry.json) with `name`, `type` (`registry:component` for blocks), `title`, `description`, any npm `dependencies`, and every source file in `files[]`.
3. Run `pnpm registry:build` and verify a fresh `public/r/<name>.json` appears.
4. (Optional) Add a preview section to [app/page.tsx](app/page.tsx) importing from the source path and include `<OpenInV0Button name="<name>" />`.
