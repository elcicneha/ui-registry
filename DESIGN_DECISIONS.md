# Design Decisions

A running log of architectural and product decisions. Each entry: what we decided, why, what else we considered, and what's still open.

---

## 2026-04-12 — `input-phone` architecture

**Decision.** Single file at `registry/new-york/blocks/input-phone/input-phone.tsx`, backed by `react-phone-number-input`. Country picker uses a ghost `Button` (with `ChevronsUpDown` icon, matching the visual of a Select trigger) + `Popover` + `Command` + `ScrollArea` for a searchable dropdown. Styling is fully self-contained — no import of `inputVariants` from `blocks/input.tsx`. All new shadcn primitives (popover, command, scroll-area, button, dialog) live in `registry/new-york/ui/` following the existing pattern; not in `components/ui/`.

**Context.** Needed a phone input that fits the registry's standalone philosophy: installable without side effects on other components. The wrapping `<div>` owns the border, shadow, and `focus-within:` ring so both the country trigger and the number field share a single unified focus state. The inner `<input>` (via `inputComponent` prop) inlines its own content classes, modelled on `registry/new-york/ui/input.tsx` but not imported from it.

**Options considered.**
- **A. Native `<select>` with opacity-0 overlay over a styled trigger.** Zero dependencies, keyboard/mobile native, screen-reader friendly. Rejected in favor of B because it loses the searchable filter UX for 200+ countries.
- **B. `Button` + `Popover` + `Command` + `ScrollArea` (chosen).** Full search/filter, consistent with shadcn design language, composable. The `Button` visual is styled to match shadcn's `SelectTrigger` (ghost variant, `ChevronsUpDown` icon, same height).
- **C. shadcn `Select` component.** Cleaner API but Radix `Select` doesn't support search/filter natively; wiring its controlled value into `react-phone-number-input`'s `countrySelectComponent` API is awkward.

**Why.** The `react-phone-number-input` library handles the genuinely hard parts (E.164 parsing, AsYouType formatting, full country metadata, smart caret) so the component stays focused on presentation. The `Button` + `Popover` + `Command` combo is the established shadcn pattern for searchable selects and keeps the experience consistent with other pickers in the ecosystem.

**Still open.** A custom no-library version (zero deps, inline country list, emoji flags) remains deferred. Would be useful as a lighter alternative for projects that don't need full E.164 validation. Revisit if there's demand.

**Related files.** `blocks/input-phone/input-phone.tsx` (canonical), `registry/new-york/ui/popover.tsx`, `registry/new-york/ui/command.tsx`, `registry/new-york/ui/scroll-area.tsx`, `registry/new-york/ui/dialog.tsx` (added as dependencies).

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
