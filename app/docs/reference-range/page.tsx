import type { Metadata } from "next"
import * as React from "react"
import fs from "node:fs/promises"
import path from "node:path"

import { CodeBlock } from "@/components/code-block"
import { ComponentPreview } from "@/components/component-preview"
import { DocBreadcrumb } from "@/components/doc-breadcrumb"
import { DocExample } from "@/components/doc-example"
import { InstallSection } from "@/components/install-section"
import { OpenInV0Button } from "@/components/open-in-v0-button"
import { PropsTable, type PropRow } from "@/components/props-table"
import { loadExampleSource } from "@/lib/docs"
import { makeCliCommands } from "@/lib/registry"
import { highlightCode } from "@/lib/highlight-code"
import BasicExample from "./examples/basic"
import EqualDistributionExample from "./examples/equal-distribution"
import OpenEndedExample from "./examples/open-ended"
import TwoZoneBinaryExample from "./examples/two-zone-binary"
import CustomPointerExample from "./examples/custom-pointer"

export const metadata: Metadata = {
  title: "Reference Range",
  description:
    "A horizontal segmented bar that places a value against an ordered set of zones — useful for blood test results, credit scores, AQI, and other severity-coded readings.",
}

const REGISTRY_NAME = "reference-range"
const MANUAL_TARGET_PATH = "components/ui/reference-range.tsx"
const REGISTRY_SOURCE_PATH =
  "registry/new-york/blocks/reference-range/reference-range.tsx"
const NPM_DEPENDENCIES = ["class-variance-authority"]

const referenceRangeProps: PropRow[] = [
  {
    name: "ranges",
    type: "ReferenceRangeItem[]",
    description:
      "Ordered, ascending list of zones. Each item has start, end, color, and an optional label. Use null on start or end for open-ended bookends like '< 20' or '> 200'.",
  },
  {
    name: "value",
    type: "number",
    description: "The current reading. Determines pointer position and color.",
  },
  {
    name: "unit",
    type: "string",
    description: "Optional unit shown next to the value above the pointer (e.g. \"mg/dL\").",
  },
  {
    name: "distribution",
    type: '"proportional" | "equal"',
    default: '"proportional"',
    description:
      "Proportional sizes each segment by its numeric width. Equal gives every segment the same width regardless of numeric range.",
  },
  {
    name: "showValue",
    type: "boolean",
    default: "true",
    description: "Show the numeric value above the pointer triangle.",
  },
  {
    name: "formatValue",
    type: "(v: number) => string",
    description: "Custom formatter for the pointer value.",
  },
  {
    name: "formatTick",
    type: "(v: number) => string",
    description: "Custom formatter for tick labels under the bar.",
  },
  {
    name: "tickLabels",
    type: '"boundaries" | "none" | number[]',
    default: '"boundaries"',
    description:
      "Show ticks at all defined inner boundaries (default), hide ticks entirely, or pass an explicit array of values to label.",
  },
  {
    name: "renderPointer",
    type: "(ctx) => ReactNode",
    description:
      "Replace the default triangle pointer. Receives { value, color, percent, range }.",
  },
  {
    name: "renderSegment",
    type: "(ctx) => ReactNode",
    description:
      "Replace the default segment renderer. Receives { range, index, widthPercent, isOpenStart, isOpenEnd }.",
  },
  {
    name: "className",
    type: "string",
    description: "Extra classes merged onto the outer wrapper element.",
  },
]

const tokenSnippet = `/* Add to your globals.css. Severity scale: 1 = very bad, 5 = excellent.
   Delete, rename, or add more (--range-6, --range-7) as your domain needs. */
@theme inline {
  --color-range-1: var(--range-1);
  --color-range-2: var(--range-2);
  --color-range-3: var(--range-3);
  --color-range-4: var(--range-4);
  --color-range-5: var(--range-5);
}

:root {
  --range-1: oklch(0.62 0.20 25);
  --range-2: oklch(0.72 0.16 32);
  --range-3: oklch(0.82 0.14 80);
  --range-4: oklch(0.80 0.15 145);
  --range-5: oklch(0.62 0.17 150);
}

.dark {
  --range-1: oklch(0.60 0.19 25);
  --range-2: oklch(0.70 0.15 32);
  --range-3: oklch(0.80 0.14 80);
  --range-4: oklch(0.78 0.16 145);
  --range-5: oklch(0.62 0.18 150);
}`

async function loadManualSource() {
  try {
    return await fs.readFile(
      path.join(process.cwd(), REGISTRY_SOURCE_PATH),
      "utf-8"
    )
  } catch {
    return "// Source unavailable at build time."
  }
}

export default async function ReferenceRangeDocsPage() {
  const [
    manualSource,
    basicCode,
    equalDistributionCode,
    openEndedCode,
    twoZoneBinaryCode,
    customPointerCode,
  ] = await Promise.all([
    loadManualSource(),
    loadExampleSource("app/docs/reference-range/examples/basic.tsx"),
    loadExampleSource("app/docs/reference-range/examples/equal-distribution.tsx"),
    loadExampleSource("app/docs/reference-range/examples/open-ended.tsx"),
    loadExampleSource("app/docs/reference-range/examples/two-zone-binary.tsx"),
    loadExampleSource("app/docs/reference-range/examples/custom-pointer.tsx"),
  ])

  const manualSourceHtml = await highlightCode(manualSource, "tsx")

  return (
    <div className="flex flex-col gap-12">
      <DocBreadcrumb title="Reference Range" />

      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1>Reference Range</h1>
            <p>
              A horizontal segmented bar that places a value against an ordered
              set of zones. Designed for clinical reference ranges (LDL, hsCRP,
              BUN), but works equally well for credit scores, AQI, battery
              health, or any severity-coded reading.
            </p>
          </div>
          <OpenInV0Button name={REGISTRY_NAME} />
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 id="preview">Preview</h2>
        <ComponentPreview code={basicCode}>
          <BasicExample />
        </ComponentPreview>
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="installation">Installation</h2>
        <InstallSection
          cliCommands={makeCliCommands(REGISTRY_NAME)}
          deps={NPM_DEPENDENCIES}
          source={manualSource}
          sourceHtml={manualSourceHtml}
          sourcePath={MANUAL_TARGET_PATH}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="color-tokens">Color tokens</h2>
        <p>
          The component does no token resolution — <code>color</code> is passed
          straight to <code>backgroundColor</code>. Pass any valid CSS color
          (hex, oklch, hsl) or a CSS variable reference. The starter kit below
          adds five severity tokens (<code>--range-1</code> through{" "}
          <code>--range-5</code>) you can paste into your{" "}
          <code>globals.css</code>. Rename them, delete them, or add more — the
          component never references the names.
        </p>
        <CodeBlock code={tokenSnippet} language="css" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="usage">Usage</h2>
        <CodeBlock
          code={`import { ReferenceRange } from "@/components/ui/reference-range"`}
          language="tsx"
        />
        <CodeBlock
          code={`<ReferenceRange
  value={135}
  unit="mg/dL"
  ranges={[
    { start: null, end: 100, color: "var(--range-5)" },
    { start: 100, end: 130, color: "var(--range-4)" },
    { start: 130, end: 160, color: "var(--range-3)" },
    { start: 160, end: 190, color: "var(--range-2)" },
    { start: 190, end: null, color: "var(--range-1)" },
  ]}
/>`}
          language="tsx"
        />
      </section>

      <section className="flex flex-col gap-8">
        <h2 id="examples">Examples</h2>
        <div className="flex flex-col gap-12">
          <DocExample
            title="Open-ended bookends"
            description={
              <>
                Real lab reports usually express the extreme zones as{" "}
                <code>{"< X"}</code> or <code>{"> Y"}</code>. Pass{" "}
                <code>start: null</code> or <code>end: null</code> and the
                component sizes those segments using the average width of the
                closed segments. If the value falls outside, the open segment
                stretches to fit with a 5% margin.
              </>
            }
            code={openEndedCode}
          >
            <OpenEndedExample />
          </DocExample>

          <DocExample
            title="Equal distribution"
            description={
              <>
                Use <code>distribution=&quot;equal&quot;</code> when narrow
                clinical zones get squeezed too thin to read, or when zone
                count matters more than numeric width. Tick labels stay
                numerically correct.
              </>
            }
            code={equalDistributionCode}
          >
            <EqualDistributionExample />
          </DocExample>

          <DocExample
            title="Two-zone binary"
            description={
              <>
                A minimal good/bad case. Pick any two of the shipped tokens or
                use raw colors — there&apos;s no requirement to use all five.
              </>
            }
            code={twoZoneBinaryCode}
          >
            <TwoZoneBinaryExample />
          </DocExample>

          <DocExample
            title="Custom pointer"
            description={
              <>
                Replace the default triangle pointer via{" "}
                <code>renderPointer</code>. The render function receives{" "}
                <code>{"{ value, color, percent, range }"}</code>.
              </>
            }
            code={customPointerCode}
          >
            <CustomPointerExample />
          </DocExample>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 id="api-reference">API Reference</h2>

        <div className="flex flex-col gap-3">
          <h3 id="referencerange">ReferenceRange</h3>
          <p>
            A flat, data-driven component. <code>ranges</code> is an array of{" "}
            <code>{"{ start, end, color, label? }"}</code> entries.{" "}
            <code>start</code> and <code>end</code> are inclusive on the start
            and exclusive on the end (<code>[start, end)</code>); the last
            range is fully inclusive. <code>color</code> is a pass-through CSS
            string — token reference, hex, oklch, anything valid for{" "}
            <code>background-color</code>.
          </p>
          <PropsTable rows={referenceRangeProps} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 id="accessibility">Accessibility</h2>
        <ul>
          <li>
            The bar carries <code>role=&quot;img&quot;</code> with an{" "}
            <code>aria-label</code> that announces the current value and unit.
          </li>
          <li>
            The pointer triangle is marked <code>aria-hidden</code> — it is
            decorative; the value text and bar label communicate the reading.
          </li>
          <li>
            Color alone should not be the sole signal of severity. Pair the
            component with a textual label (e.g. &ldquo;High&rdquo;,
            &ldquo;Borderline&rdquo;) for users who can&apos;t distinguish the
            range hues. The optional <code>label</code> field on each range is
            surfaced as a tooltip; consider rendering it visually too.
          </li>
        </ul>
      </section>
    </div>
  )
}
