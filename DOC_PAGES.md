# Doc Pages

Detailed instructions for creating documentation pages under `app/docs/`. Referenced from [CLAUDE.md](CLAUDE.md) step 4.

## File structure

Each component gets its own subfolder:

```
app/docs/<name>/
├── page.tsx                  # async server component — the docs page
└── examples/
    ├── basic.tsx             # required — default demo, also used for preview screenshots
    ├── controlled.tsx        # one file per demo variant
    └── ...
```

## Example files (`examples/*.tsx`)

- Each file is a default-export React component.
- Import the block from `@/registry/new-york/blocks/<name>/<name>` (not from `@/components/ui/`); `loadExampleSource()` rewrites these imports to consumer-facing paths at display time.
- Keep each demo minimal and focused on one prop or feature.
- Add `"use client"` only when the demo needs state.

## Page file (`page.tsx`)

Async server component. Use [app/docs/input-otp/page.tsx](app/docs/input-otp/page.tsx) as the reference implementation.

### Constants at the top

```ts
const REGISTRY_NAME = "<name>"
const MANUAL_TARGET_PATH = "components/ui/<name>.tsx"   // path shown to consumers in manual install
const REGISTRY_SOURCE_PATH = "registry/new-york/blocks/<name>/<name>.tsx"
const NPM_DEPENDENCIES = ["<npm-package>"]
```

### Source loaders

- `loadManualSource()` — reads the block source file at `REGISTRY_SOURCE_PATH` for the manual install tab.
- `loadExampleSource()` from `@/lib/docs` — strips `"use client"` and rewrites internal registry imports to consumer-facing `@/components/ui/<name>` paths automatically.

### Imports

Always import these (plus any example components):

```ts
import { CodeBlock } from "@/components/code-block"
import { ComponentPreview } from "@/components/component-preview"
import { DocBreadcrumb } from "@/components/doc-breadcrumb"
import { DocExample } from "@/components/doc-example"
import { InstallSection } from "@/components/install-section"
import { OpenInV0Button } from "@/components/open-in-v0-button"
import { PropsTable, type PropRow } from "@/components/props-table"
import { loadExampleSource } from "@/lib/docs"
import { makeCliCommands } from "@/lib/registry"
```

### Sections (in order)

Include a back link to `/` via `<DocBreadcrumb>` and `<OpenInV0Button name={REGISTRY_NAME} />` in the header.

#### 1. Preview

`ComponentPreview` wrapping the basic demo + its `loadExampleSource` string.

#### 2. Installation

`InstallSection` with `cliCommands`, `deps`, `source`, `sourcePath`.

#### 3. Usage

Two `CodeBlock`s — one for the import statement, one for basic JSX usage. This mirrors the pattern on shadcn's documentation site.

- **Import block**: show the consumer-facing import path (`@/components/ui/<name>`), listing every exported symbol the consumer would typically use.
- **JSX block**: show minimal but realistic usage — enough props/children to be copy-pasteable, not a full kitchen-sink demo.

Example (from input-otp):

```tsx
<section className="flex flex-col gap-4">
  <h2 id="usage">Usage</h2>
  <CodeBlock
    code={`import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"`}
    language="tsx"
  />
  <CodeBlock
    code={`<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>`}
    language="tsx"
  />
</section>
```

#### 4. Composition (only if the component has sub-components)

Render the component tree as a `CodeBlock` using a plain-text tree with `├──`/`│`/`└──` characters, **not JSX**. Lead with: `Use the following composition to build a <ComponentName>:`

#### 5. Examples

One `DocExample` per variant with `title`, `description`, `code`, and the rendered component as children.

#### 6. API Reference

`PropsTable` for each exported component. Define the `PropRow[]` arrays as constants at the top of the file.

#### 7. Accessibility

Bullet list covering: keyboard behaviour, ARIA attributes used, screen-reader notes.
