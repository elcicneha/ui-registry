# Design Decisions

A running log of architectural and product decisions. Each entry: what we decided, why, what else we considered, and what's still open.

---

## 2026-04-27 — `input-phone` no longer strips `+cc` on blur

**Decision.** Removed the blur-time `stripCountryCode` hack (and its sibling autofill stripper) from `input-phone.tsx`. The input now always shows the library's native international format (e.g. `+1 (234) 320-3423`) regardless of focus state. `PhoneInputField` is back to a thin forwardRef wrapping the `<input>`; only the modifier+delete keydown guard remains.

**Context.** The strip rewrote `el.value` to the parsed national number on blur and dispatched a synthetic `input` event so the library reformatted to `(234) 320-3423`. This worked visually but desynced the library's internal `phoneDigits` state from its assumptions: deleting a digit during a re-edit dropped the partial E.164 below 10 digits, and `getCountryForPartialE164Number` returned `undefined` (no `defaultCountry` or `latestCountrySelectedByUser` fallback) — clearing the country selector. Typing the digit back then prepended `+` (per the library's no-country branch), and `+234…` re-parsed as Nigeria. Manual country selection didn't hit the bug because clicking the picker sets `latestCountrySelectedByUser`, which the fallback chain *does* check.

**Options considered.**
- **A. Strip on blur, restore `+cc` on focus.** Fixes the state desync at the cost of a visible jump on every focus and caret-position fiddling. Worst UX of the three.
- **B. Keep stripping, add `defaultCountry` tracking via `onCountryChange`.** Promotes the library's auto-detected country to a sticky fallback so partial edits don't clear it. Works, but indirect — relies on a specific line in the library's country-resolution chain ([phoneInputHelpers.js:394](node_modules/react-phone-number-input/modules/helpers/phoneInputHelpers.js#L394)) and continues fighting the library's design.
- **C. Don't strip (chosen).** Library works exactly as designed; zero surface for editing bugs; `stripCountryCode` and the autofill `useEffect` both go away. Tradeoff: the input shows `+1` even though the country selector already shows `+1` next to the flag — visual redundancy.

**Why.** The strip was an aesthetic override that delivered a real bug class on every re-edit of an auto-detected number. The redundancy in option C is honest — the country code is part of the number — and the simplification is significant (removed function, removed effect, removed inner ref). If the redundancy ever needs to go, the right place to fix it is the country selector button (hide the `+cc` text when a number is present, since the flag carries the same info), not the input.

**Related files.** `registry/new-york/blocks/input-phone/input-phone.tsx`.

---

## 2026-04-19 — `input-otp` rebuilt on shadcn stock, with a `variant` prop

**Decision.** The `input-otp` block is now the freshly-installed shadcn stock source with a single addition: a `variant?: "boxed" | "joined"` prop on `InputOTP` that propagates via React context to `InputOTPGroup` and `InputOTPSlot`. `"boxed"` remains the default, so existing consumers see no visual change. `"joined"` reproduces shadcn's stock pill styling verbatim. Installed pristine copy lives at `registry/new-york/ui/input-otp.tsx` as reference; nothing imports from it — the block stays self-contained.

**Context.** The hand-written block had drifted from upstream shadcn (different slot sizing, responsive text, non-standard transition, missing `data-[active=true]:z-10`). Rebuilding on stock keeps us aligned and lets both looks coexist behind one registry item instead of forking.

**Options considered.**
- **A. Variant prop on one component (chosen).** Single file, single install, context-driven style swap. Consumers who upgrade get both looks. One registry entry, one doc page.
- **B. Two separate registry items** (`input-otp`, `input-otp-joined`). Cleaner code per file but doubles the surface area of the registry and forces docs/homepage duplication.
- **C. CVA `inputOTPVariants` export.** Overkill for two shapes; no composition story; ergonomically worse than a typed union.

**Kept from the previous hand-written block**: `w-fit` on the root `OTPInput` container (so it sizes to content), and `transition-[color,box-shadow]` on the slot (scoped transitions). **Dropped**: `aspect-square h-9 w-auto shrink-0` (back to stock `h-9 w-9`) and `text-base md:text-sm` (back to stock `text-sm`) — the iOS-zoom and aspect-ratio tweaks were judged not worth the drift from upstream.

**Docs UX.** Single global `Variant: [Boxed] [Joined]` toggle in the page header (below the `<h1>`) re-renders every preview — hero + all seven example demos — in the selected variant. Toggle state lives in a small `DocsVariantProvider` context; each preview/example is wrapped in a `VariantComponentPreview` / `VariantDocExample` client shell that reads the context and passes `variant` into the example component as a prop. Loaded source strings show `variant={variant}` — a legitimate consumer pattern.

**Why.** Keeping the block in sync with shadcn upstream avoids silent drift when the stock component changes. A single-file, single-install delivery matches the project's "shadcn-native" philosophy. Boxed-as-default preserves the registry's identity without breaking anyone who already installed the component.

**Supersedes.** The 2026-04-11 entry below — input-otp still ships standalone with no `registryDependencies`, but is no longer a fork of the stock source; it now extends it.

**Related files.** `registry/new-york/blocks/input-otp/input-otp.tsx` (rewritten), `registry/new-york/ui/input-otp.tsx` (pristine, reference-only), `components/docs-variant-context.tsx`, `components/docs-variant-toggle.tsx`, `components/variant-preview.tsx` (new shared docs plumbing, reusable for future multi-variant components).

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
