# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A custom shadcn component registry built on the shadcn registry template. Components authored here are published as static JSON under `public/r/*.json`, which the `shadcn` CLI consumes when users run `shadcn add` against this registry. The Next.js app itself is a gallery that previews the registered components and wires up "Open in v0" links.

Stack: Next.js 15 (App Router, Turbopack), React 19, Tailwind CSS v4, TypeScript, pnpm.

Fonts: DM Sans (`--font-sans`, body text) and Instrument Serif (`--font-display`, homepage hero). Both loaded via `next/font/google` in `app/layout.tsx`.

## Commands

```bash
pnpm dev              # next dev --turbopack — runs the preview gallery
pnpm build            # next build
pnpm lint             # next lint (ESLint 9 + eslint-config-next)
pnpm registry:build   # shadcn build — compiles registry.json → public/r/*.json
```

There is no test runner configured in this repo.

`NEXT_PUBLIC_BASE_URL` must be set for the "Open in v0" button to produce a working URL — it embeds `${NEXT_PUBLIC_BASE_URL}/r/<name>.json` into the v0 deeplink (see [components/open-in-v0-button.tsx:19](components/open-in-v0-button.tsx#L19)). Falls back to `VERCEL_PROJECT_PRODUCTION_URL` or `VERCEL_URL` when deployed to Vercel (see [lib/registry.ts](lib/registry.ts)).

### Dark mode

Custom implementation — no `next-themes`. A blocking `<script>` in `app/layout.tsx` reads `localStorage('theme')` or `prefers-color-scheme` and adds/removes `.dark` on `<html>` before first paint (prevents flash). React state syncs via the `Providers` context in [app/providers.tsx](app/providers.tsx), which exports `useTheme()` → `{ theme, toggleTheme }`. Tailwind's dark variant is configured as `@custom-variant dark (&:is(.dark *))` in `globals.css`.

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
- [app/docs/](app/docs/) — documentation pages. Each component gets its own subfolder: `app/docs/<name>/page.tsx` (server component, docs layout) and `app/docs/<name>/examples/*.tsx` (one file per demo variant, each a default-export React component). Three-column layout: sidebar (`DocsSidebar`), content (max-w-2xl), TOC (`DocToc` with IntersectionObserver heading tracking). Sidebars hide on mobile.
- [app/preview/\[name\]/](app/preview/%5Bname%5D/page.tsx) — dynamic route that renders a bare component (no header/footer) for Playwright screenshot capture. Has a `previews` map that must be kept in sync when adding components.
- [app/about/](app/about/) — personal about page (not part of the registry).
- [lib/utils.ts](lib/utils.ts) — `cn()` helper (`clsx` + `tailwind-merge`). Path alias `@/lib/utils` is the shadcn convention; preserve it in block source so generated JSON resolves correctly on consumers.
- [lib/registry-items.ts](lib/registry-items.ts) — the central list of components shown on the homepage and sidebar. Each entry has `name`, `title`, `description`, `href`, optional `status` (`"new"` | `"stable"` | `"beta"`), and optional `imageFit` (`"contain"` | `"cover"`). **When adding a new component, add an entry here** (this is what step 5 in the checklist refers to for `app/page.tsx`, which reads from this file).
- [lib/registry.ts](lib/registry.ts) — `baseUrl` resolution and `makeCliCommands(name)` / `makeDepsCommands(packages)` for generating per-package-manager install commands shown on doc pages.
- [lib/docs.ts](lib/docs.ts) — `loadExampleSource(filePath)` reads example files at build time, strips `"use client"`, and rewrites `@/registry/new-york/blocks/<name>/...` imports to consumer-facing `@/components/ui/<name>` paths.
- [public/r/](public/r/) — **generated output**. Do not hand-edit; regenerate via `pnpm registry:build`.

### Global element styles

`app/globals.css` defines base styles for several HTML elements via `@layer base`. Do not add equivalent classes directly on these elements — the global styles already apply:

| Element | Global styles applied |
|---|---|
| `h1` | `text-3xl font-bold tracking-tight` |
| `h2` | `text-xl font-semibold tracking-tight scroll-mt-20` |
| `h3` | `text-lg font-semibold tracking-tight scroll-mt-20` |
| `p` | `text-base text-muted-foreground` |
| `ul` | `list-disc space-y-1 pl-5 text-sm text-muted-foreground` |
| `code` (inline) | `rounded-sm bg-muted px-1.5 py-1 font-mono text-sm font-medium text-foreground/80` |
| `code` (all) | `font-mono text-foreground/90` |
| `kbd` | `rounded border px-1 py-0.5 font-mono text-xs` |

There is also a `.display-h1` utility class (`font-display animate-fade-up text-4xl font-normal leading-tight tracking-tight`) used only on the homepage hero.

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
- Follow the detailed instructions in [DOC_PAGES.md](DOC_PAGES.md) — it covers file structure, example files, page layout, required sections, and the reference implementation.

**5. Update [lib/registry-items.ts](lib/registry-items.ts)**
- Add a new entry to the `registryItems` array with `name`, `title`, `description`, and `href: "/docs/<name>"`. Optionally set `status` (`"new"`, `"stable"`, `"beta"`) and `imageFit` (`"contain"` default, or `"cover"` for tall previews). The homepage ([app/page.tsx](app/page.tsx)) and sidebar ([components/docs-sidebar.tsx](components/docs-sidebar.tsx)) both read from this array.

**5a. Register the preview route**
- Open [app/preview/[name]/page.tsx](app/preview/%5Bname%5D/page.tsx) and add the new component to the `previews` map (import its `basic.tsx` and add a `"<name>": ComponentBasic` entry).

**5b. Generate the preview screenshot**
- Run `pnpm capture-previews <name>` (starts the dev server if not already running, screenshots `/preview/<name>`, saves to `public/previews/<name>.png`).
- Stage the generated PNG alongside the source changes before committing. The pre-commit hook will block the commit if the PNG is missing from the staged files.

**6. Verify `pnpm build` passes**
- Fix any TypeScript or import errors before marking the task complete.

**7. Append a [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md) entry** (for non-trivial architectural choices only).

## Preview screenshots

Homepage cards show static PNG screenshots instead of live components, to avoid shipping component JS in the homepage bundle.

- Screenshots live in [public/previews/](public/previews/) — **do not hand-edit**. Each component produces two files: `<name>.png` (light) and `<name>-dark.png` (dark). The homepage switches between them via `dark:hidden` / `hidden dark:block`.
- Generated by: `pnpm capture-previews <name>` (one) or `pnpm capture-previews <a> <b>` (several). Running without arguments errors — a component name is always required.
- The script uses Playwright (Chromium), auto-starts a dev server on **port 3005** if one isn't running, and screenshots the `/preview/<name>` route. It strips the header/footer and zooms the component to fill an 800px viewport.
- **Never run `pnpm capture-previews --all`** unless the user explicitly asks. Only regenerate the specific component(s) that changed.
- `--all` exists for rare cases like a preview layout redesign or Chromium update — not for routine use.
- The script auto-discovers components from `app/docs/` — any folder with an `examples/basic.tsx` is captured.
- **After modifying any `app/docs/<name>/examples/basic.tsx`**, run `pnpm capture-previews <name>` and stage the updated PNG. The pre-commit hook (`.git/hooks/pre-commit`) enforces this — it will block a commit that stages `basic.tsx` without the corresponding PNG.


## Philosophy

1. Showing the imperfect but real side of things. Show what they look like when they break.