# Design Decisions

A running log of architectural and product decisions. Each entry: what we decided, why, what else we considered, and what's still open.

---

## 2026-04-11 — `input-otp` ships standalone, not as part of an input system

**Decision.** `input-otp` inlines its base classes directly, has no `registryDependencies`, and does not import `inputVariants` from our custom `input.tsx`. It's a drop-in alternative to shadcn's joined pill-style OTP, installable without disturbing anything else in the user's project.

**Context.** The original idea was to define input styling once via `cva` in our custom `input.tsx`, export `inputVariants`, and have `input-otp` (and eventually `input-phone`, `textarea`, etc.) import it so everything stays in sync — edit once, cascade everywhere.

The problem is distribution. A user installing `input-otp` via the shadcn CLI almost certainly already has shadcn's default `input` at `components/ui/input.tsx`. If `input-otp` lists our custom input as a `registryDependency`, the CLI overwrites (or prompts to overwrite) their existing file. Hostile for anyone who just wants the OTP component and nothing else.

**Options considered.**
- **A. Opinionated replacement.** Accept that installing `input-otp` replaces the user's `input.tsx`. Cascade works within our ecosystem. Requires clear documentation so users opt in knowingly.
- **B. Tailwind v4 `@theme` tokens.** Move style values (height, radius, ring width, etc.) into CSS variables via `@theme`. Components reference tokens instead of hardcoded classes. Real cascading, no file conflict. Rejected for now — too much abstraction for the current number of components.
- **C. `@layer components` + `data-slot` selectors.** Rejected: Tailwind utilities in component `className` live in the utilities layer and always win specificity, defeating the cascade unless components ship with no inline classes.
- **D. `inputVariants` in a shared lib file.** Rejected: static snapshot, not actually cascading — user customizations to their own input don't propagate.
- **E. Standalone, shadcn-native (chosen).** Each component self-contained. Accepts shadcn's copy-paste duplication philosophy. Cascade is manual.

**Why.** Lowest friction for users, shippable immediately, doesn't force a design-system commitment before the family is big enough to justify one. Portfolio benefit is higher from shipping multiple standalone components than from one half-finished system.

**Still open.** The input system (Road 2) is not dead. It does not have to be a separate "design system" product — it can live in this same registry as a different install path, a set of components that share one styling file. Revisit when there are enough input-family components (input, input-otp, input-phone, textarea, select, combobox) to justify it. Current leaning is Option A (opinionated replacement, documented clearly), not committed.

**Related files.** `blocks/input-otp/input-otp.tsx` (canonical), `blocks/input.tsx` (unused by OTP, kept as a standalone registry item and Road 2 building block).

---
