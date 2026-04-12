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

- [registry/new-york/blocks/](registry/new-york/blocks/) — components distributed through the registry. These are what `registry.json` points at. A block can be a single `.tsx` file or a folder of related files (e.g. [input-otp/](registry/new-york/blocks/input-otp/), [input-phone/](registry/new-york/blocks/input-phone/)); match the folder structure to the paths declared in `registry.json`. **Prefer the folder form** — it's future-proof for multi-file blocks.
- [registry/new-york/ui/](registry/new-york/ui/) — shadcn primitives installed as-is via `pnpm shadcn add`. **Never modify files here.** These are the pristine upstream source. When a block needs a shadcn dependency, install it here and list it under `registryDependencies` in `registry.json`.
- [components/ui/](components/ui/) — customized versions of shadcn primitives. If a shadcn primitive needs styling changes for this project, copy it here and modify it. Never change the version in `registry/new-york/ui/`.
- [components/](components/) — app-only components (e.g. `OpenInV0Button`, `CodeBlock`, `ComponentPreview`, `InstallSection`) that are not distributed.
- [app/docs/](app/docs/) — documentation pages. Each component gets its own subfolder: `app/docs/<name>/page.tsx` (server component, docs layout) and `app/docs/<name>/examples/*.tsx` (one file per demo variant, each a default-export React component).
- [lib/utils.ts](lib/utils.ts) — `cn()` helper. Path alias `@/lib/utils` is the shadcn convention; preserve it in block source so generated JSON resolves correctly on consumers.
- [public/r/](public/r/) — **generated output**. Do not hand-edit; regenerate via `pnpm registry:build`.

### Global element styles

`app/globals.css` defines base styles for several HTML elements via `@layer base`. Do not add equivalent classes directly on these elements — the global styles already apply:

| Element | Global styles applied |
|---|---|
| `h1` | `text-3xl font-bold tracking-tight` |
| `h2` | `text-xl font-semibold tracking-tight` |
| `h3` | `text-lg font-semibold tracking-tight` |
| `p` | `text-base text-muted-foreground` |
| `code` (inline) | `rounded-sm bg-muted px-1.5 py-1 font-mono text-sm font-medium text-foreground/80` |
| `code` (all) | `font-mono text-foreground/90` |
| `kbd` | `rounded border px-1 py-0.5 font-mono text-xs` |

Only `<div>` and `<span>` are free of global styles — add classes freely there. For all other elements, only add a class if it genuinely overrides the global (e.g. `text-sm` on a `<p>` when you explicitly want smaller-than-normal text).

### Styling rules

**For registry block components** (`registry/new-york/blocks/`):
- Self-contain all styles via `cn()` — inline every class, modelled on `registry/new-york/ui/input.tsx`. Never import `inputVariants` or styling utilities from sibling block files (distribution conflict).
- Don't duplicate classes already applied by the component's default styles. Add `className` only when the new style is genuinely additive.
- The wrapper pattern: a `<div>` with `focus-within:` ring owns the border/shadow for composite inputs. Inner `<input>` elements carry only content classes (no border/shadow/rounded).

**For app-level usage** (components used in the docs/gallery, not distributed):
- Do not add custom `className` overrides at the call site. If a component needs to look different, change the component file itself — not the usage.
- Always confirm with the user before modifying any component in `components/` or `components/ui/`.
- Never modify files in `registry/new-york/ui/` for any reason.

### Style / conventions baked into the template

- `components.json` declares `style: "new-york"`, `baseColor: "neutral"`, Tailwind v4 with CSS variables, `rsc: true`, and the `@/` aliases (`components`, `ui`, `lib`, `utils`, `hooks`). New blocks should import via these aliases.
- Existing blocks (see [registry/new-york/blocks/input.tsx](registry/new-york/blocks/input.tsx)) export a `cva`-based `*Variants` alongside the component so consumers can compose styles — follow that pattern when adding variants.

## Adding a new registry item — checklist

Complete every step in order. Do not consider the task done until all steps pass.

**1. Write the component source**
- Place under `registry/new-york/blocks/<name>/<name>.tsx` (folder form preferred).
- Self-contained: inline all base classes, no import of `inputVariants` from other blocks.
- If a shadcn primitive is needed as a dependency (e.g. Popover, Command): install it with `pnpm shadcn add <primitive>` — it goes to `registry/new-york/ui/`. List it in `registryDependencies` in `registry.json`. Import it in the block as `@/registry/new-york/ui/<primitive>`.

**2. Update [registry.json](registry.json)**
- Add a new `items[]` entry: `name`, `type: "registry:component"`, `title`, `description`, `dependencies` (npm), `registryDependencies` (shadcn), `files[]`.

**3. Run `pnpm registry:build`**
- Verify `public/r/<name>.json` appears. If it doesn't, check the `files[]` paths in `registry.json`.

**4. Create the docs page**
- Create `app/docs/<name>/examples/*.tsx` — one file per demo variant (e.g. `basic.tsx`, `controlled.tsx`). Each file is a default-export React component. Import the block from `@/registry/new-york/blocks/<name>/<name>`. Keep each demo minimal and focused on one prop or feature. Add `"use client"` only when the demo needs state.
- Create `app/docs/<name>/page.tsx` — async server component. Follow the structure from [app/docs/input-otp/page.tsx](app/docs/input-otp/page.tsx):
  - Constants at the top: `REGISTRY_NAME`, `MANUAL_TARGET_PATH` (always `components/ui/<name>.tsx` — the path shown to consumers in the manual install step), `REGISTRY_SOURCE_PATH`, `NPM_DEPENDENCIES`.
  - `loadManualSource()` reads the block source file at `REGISTRY_SOURCE_PATH` for the manual install tab.
  - Load code strings with `loadExampleSource()` from `@/lib/docs` — it strips `"use client"` and rewrites internal registry imports to consumer-facing `@/components/ui/<name>` paths automatically. This means example `.tsx` files should import from `@/registry/new-york/blocks/<name>/<name>` (not from `@/components/ui/`); the rewrite happens at display time.
  - Sections (in order): **Preview** (`ComponentPreview` wrapping the basic demo + its `loadExampleSource` string), **Installation** (`InstallSection` with `name`, `deps`, `source`, `sourcePath`), **Composition** (only if the component has sub-components — render the component tree as a `CodeBlock` using a plain-text tree with `├──`/`│`/`└──` characters, **not JSX**; lead with `Use the following composition to build a <ComponentName>:`), **Examples** (one `DocExample` per variant with `title`, `description`, `code`, and the rendered component as children), **API Reference** (`PropsTable` for each exported component — define `PropsTable` inline in the page, copy from the OTP page), **Accessibility** (bullet list: keyboard behaviour, ARIA attributes used, screen-reader notes).
  - Include a back link to `/` and `<OpenInV0Button name={REGISTRY_NAME} />` in the header.

**5. Update [app/page.tsx](app/page.tsx)**
- Import the component from its block source path.
- Add a new entry to the `items` array with `name`, `title`, `description`, `href: "/docs/<name>"`, and a `preview` JSX node.

**6. Verify `pnpm build` passes**
- Fix any TypeScript or import errors before marking the task complete.

**7. Append a [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md) entry** (for non-trivial architectural choices only).
