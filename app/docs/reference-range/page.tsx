import type { Metadata } from "next"
import * as React from "react"
import fs from "node:fs/promises"
import path from "node:path"

import { CodeBlock } from "@/components/code-block"
import { CodeBlockColorTokens } from "@/components/code-block-color-tokens"
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
import LabeledZonesExample from "./examples/labeled-zones"
import CustomFormattingExample from "./examples/custom-formatting"
import CustomPointerExample from "./examples/custom-pointer"
import MinSegmentWidthExample from "./examples/min-segment-width"

export const metadata: Metadata = {
  title: "Reference Range",
  description:
    "A horizontal segmented bar that places a value against an ordered set of zones — useful for blood test results, credit scores, AQI, battery health, and other severity-coded readings.",
}

const REGISTRY_NAME = "reference-range"
const MANUAL_TARGET_PATH = "components/ui/reference-range.tsx"
const REGISTRY_SOURCE_PATH =
  "registry/new-york/blocks/reference-range/reference-range.tsx"
const NPM_DEPENDENCIES = ["class-variance-authority"]

const referenceRangeProps: PropRow[] = [
  {
    name: "ranges",
    type: "[ReferenceRangeFirst, ...ReferenceRangeRest[]]",
    description:
      "Ordered list of zones. Only the first range requires start (use null for open-ended); subsequent ranges derive start from the previous range's end — omit it. Providing a mismatched start throws a runtime error.",
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
    name: "minSegmentWidth",
    type: "number | string",
    default: '"1.25rem"',
    description:
      "Floor for each segment's rendered width. Accepts any CSS length (rem, em, %, clamp(), etc.) or a number (px). Segments below the floor are pinned and the deficit is redistributed proportionally; the pointer is positioned against the actual rendered widths so it always lands inside the correct segment. Pass 0 to disable.",
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
      "Replace the default triangle pointer. Receives { value, color, percent (0–100), range }.",
  },
  {
    name: "ranges[].label",
    type: "string",
    description:
      "Optional zone label. Shown as a tooltip on hover; render it visually too if you want it always visible.",
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

const TOKEN_HEADER = `/* Add to your globals.css. Severity scale: 1 = very bad, 5 = excellent.
   Delete, rename, or add more (--range-6, --range-7) as you need. */
@theme inline {
  --color-range-1: var(--range-1);
  --color-range-2: var(--range-2);
  --color-range-3: var(--range-3);
  --color-range-4: var(--range-4);
  --color-range-5: var(--range-5);
}`

const tokenSnippets = {
  oklch: `${TOKEN_HEADER}

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
}`,
  hex: `${TOKEN_HEADER}

:root {
  --range-1: #e64343;
  --range-2: #f87962;
  --range-3: #f3b94c;
  --range-4: #7bd77f;
  --range-5: #03a14a;
}

.dark {
  --range-1: #db4241;
  --range-2: #ed7761;
  --range-3: #edb345;
  --range-4: #6ed274;
  --range-5: #00a245;
}`,
  rgb: `${TOKEN_HEADER}

:root {
  --range-1: rgb(230 67 67);
  --range-2: rgb(248 121 98);
  --range-3: rgb(243 185 76);
  --range-4: rgb(123 215 127);
  --range-5: rgb(3 161 74);
}

.dark {
  --range-1: rgb(219 66 65);
  --range-2: rgb(237 119 97);
  --range-3: rgb(237 179 69);
  --range-4: rgb(110 210 116);
  --range-5: rgb(0 162 69);
}`,
  hsl: `${TOKEN_HEADER}

:root {
  --range-1: hsl(0 77% 58%);
  --range-2: hsl(9 91% 68%);
  --range-3: hsl(39 87% 63%);
  --range-4: hsl(123 53% 66%);
  --range-5: hsl(147 96% 32%);
}

.dark {
  --range-1: hsl(0 68% 56%);
  --range-2: hsl(9 80% 65%);
  --range-3: hsl(39 82% 60%);
  --range-4: hsl(124 53% 63%);
  --range-5: hsl(146 100% 32%);
}`,
}

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
    labeledZonesCode,
    customFormattingCode,
    customPointerCode,
    minSegmentWidthCode,
  ] = await Promise.all([
    loadManualSource(),
    loadExampleSource("app/docs/reference-range/examples/basic.tsx"),
    loadExampleSource("app/docs/reference-range/examples/equal-distribution.tsx"),
    loadExampleSource("app/docs/reference-range/examples/open-ended.tsx"),
    loadExampleSource("app/docs/reference-range/examples/labeled-zones.tsx"),
    loadExampleSource("app/docs/reference-range/examples/custom-formatting.tsx"),
    loadExampleSource("app/docs/reference-range/examples/custom-pointer.tsx"),
    loadExampleSource("app/docs/reference-range/examples/min-segment-width.tsx"),
  ])

  const manualSourceHtml = await highlightCode(manualSource, "tsx")

  const tokenSnippetsHighlighted = Object.fromEntries(
    await Promise.all(
      Object.entries(tokenSnippets).map(async ([key, code]) => [
        key,
        await highlightCode(code, "css"),
      ])
    )
  ) as Record<keyof typeof tokenSnippets, string>

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
          <code>color</code> is passed straight to <code>backgroundColor</code>{" "}
          — any valid CSS color works (hex, oklch, hsl, or a <code>var()</code>{" "}
          reference). The starter kit below defines five severity tokens you
          can paste into <code>globals.css</code>.
        </p>
        <CodeBlockColorTokens
          snippets={tokenSnippets}
          highlighted={tokenSnippetsHighlighted}
          maxExpandedHeight="25rem"
        />
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
    {              end: 130, color: "var(--range-4)" },
    {              end: 160, color: "var(--range-3)" },
    {              end: 190, color: "var(--range-2)" },
    {              end: null, color: "var(--range-1)" },
  ]}
/>`}
          language="tsx"
        />
        <p>
          Boundaries are <code>[start, end)</code> — start inclusive, end
          exclusive. The last range is inclusive on both sides. Only the first
          range takes <code>start</code>; subsequent ranges derive it from the
          previous <code>end</code>, so just specify <code>end</code>.
        </p>
      </section>

      <section className="flex flex-col gap-8">
        <h2 id="examples">Examples</h2>
        <div className="flex flex-col gap-12">
          <DocExample
            title="Open-ended bookends"
            description={
              <>
                Pass <code>start: null</code> or <code>end: null</code> for{" "}
                <code>{"< X"}</code> / <code>{"> Y"}</code> bookends. Open
                segments size to the average closed-segment width, and stretch
                if the value overflows the declared domain.
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
                zones get squeezed too thin. Ticks stay numerically positioned.
              </>
            }
            code={equalDistributionCode}
          >
            <EqualDistributionExample />
          </DocExample>

          <DocExample
            title="Labeled zones with custom ticks"
            description={
              <>
                Add a <code>label</code> per range to show on hover, and pass{" "}
                <code>tickLabels</code> as an explicit array to control which
                boundaries are annotated.
              </>
            }
            code={labeledZonesCode}
          >
            <LabeledZonesExample />
          </DocExample>

          <DocExample
            title="Minimum segment width"
            description={
              <>
                Segments below <code>minSegmentWidth</code> get pinned to it;
                the deficit is redistributed across the rest. The pointer
                follows the actual rendered widths, so it always lands inside
                the correct segment. Accepts any CSS length or a number (px).
              </>
            }
            code={minSegmentWidthCode}
          >
            <MinSegmentWidthExample />
          </DocExample>

          <DocExample
            title="Custom formatting"
            description={
              <>
                Use <code>formatValue</code> and <code>formatTick</code> to
                control how the pointer value and tick labels render.
              </>
            }
            code={customFormattingCode}
          >
            <CustomFormattingExample />
          </DocExample>

          <DocExample
            title="Custom pointer"
            description={
              <>
                Replace the default triangle via <code>renderPointer</code>.
                Receives <code>{"{ value, color, percent, range }"}</code>.
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
            <code>ranges</code> is an array of{" "}
            <code>{"{ start?, end, color, label? }"}</code> entries with{" "}
            <code>[start, end)</code> boundaries (last range inclusive on both
            sides). Only the first range requires <code>start</code>; later
            ranges derive it from the previous <code>end</code>. If you do
            provide <code>start</code> on a later range and it doesn&apos;t
            match, the component throws a runtime error — gaps and overlaps are
            not silently rendered.
          </p>
          <PropsTable rows={referenceRangeProps} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 id="accessibility">Accessibility</h2>
        <ul>
          <li>
            The bar has <code>role=&quot;img&quot;</code> with an{" "}
            <code>aria-label</code> announcing the value and unit — but{" "}
            <strong>not</strong> the zone. Render the active zone&apos;s name
            as text alongside the bar so screen readers and color-blind users
            get the severity, not just the number.
          </li>
          <li>
            The pointer is <code>aria-hidden</code> — decorative.
          </li>
          <li>
            <code>label</code> values appear as tooltips on hover (desktop
            only). Render them visually too if always-visible labels matter on
            touch devices.
          </li>
        </ul>
      </section>
    </div>
  )
}
