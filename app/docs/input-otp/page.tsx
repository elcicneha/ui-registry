import * as React from "react"
import fs from "node:fs/promises"
import path from "node:path"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { CodeBlock } from "@/components/code-block"
import { ComponentPreview } from "@/components/component-preview"
import { InstallSection } from "@/components/install-section"
import { OpenInV0Button } from "@/components/open-in-v0-button"
import {
  BasicDemo,
  DigitsOnlyDemo,
  DisabledDemo,
  SeparatorDemo,
} from "./demos"

const REGISTRY_NAME = "input-otp"
const MANUAL_TARGET_PATH = "components/ui/input-otp.tsx"
const REGISTRY_SOURCE_PATH =
  "registry/new-york/blocks/input-otp/input-otp.tsx"
const NPM_DEPENDENCIES = ["input-otp"]


const compositionCode = `InputOTP
├── InputOTPGroup
│   ├── InputOTPSlot
│   ├── InputOTPSlot
│   └── InputOTPSlot
├── InputOTPSeparator
├── InputOTPGroup
│   ├── InputOTPSlot
│   ├── InputOTPSlot
│   └── InputOTPSlot
├── InputOTPSeparator
└── InputOTPGroup
    ├── InputOTPSlot
    └── InputOTPSlot`

const basicExampleCode = `import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function Example() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}`

const separatorExampleCode = `import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function Example() {
  return (
    <InputOTP maxLength={6}>
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
    </InputOTP>
  )
}`

const digitsExampleCode = `import { REGEXP_ONLY_DIGITS } from "input-otp"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function Example() {
  return (
    <InputOTP maxLength={4} pattern={REGEXP_ONLY_DIGITS}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>
  )
}`

const disabledExampleCode = `import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function Example() {
  return (
    <InputOTP maxLength={6} disabled>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}`

type PropRow = {
  name: string
  type: string
  default?: string
  description: string
}

const inputOTPProps: PropRow[] = [
  {
    name: "maxLength",
    type: "number",
    description: "Total number of characters the input accepts. Required.",
  },
  {
    name: "value",
    type: "string",
    description: "Controlled value of the input.",
  },
  {
    name: "onChange",
    type: "(value: string) => void",
    description: "Called whenever the value changes.",
  },
  {
    name: "onComplete",
    type: "(value: string) => void",
    description: "Called once the user has filled every slot.",
  },
  {
    name: "pattern",
    type: "string",
    description:
      "Regex string that restricts allowed characters (e.g. REGEXP_ONLY_DIGITS).",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Disables interaction and dims all slots.",
  },
  {
    name: "containerClassName",
    type: "string",
    description: "Class applied to the slot container, not the hidden input.",
  },
  {
    name: "className",
    type: "string",
    description: "Class applied to the underlying hidden input element.",
  },
]

const inputOTPSlotProps: PropRow[] = [
  {
    name: "index",
    type: "number",
    description:
      "Zero-based index of the slot within the group. Must be unique and increasing.",
  },
  {
    name: "className",
    type: "string",
    description: "Extra classes merged onto the slot wrapper.",
  },
]

function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-4 py-2 font-medium">Prop</th>
            <th className="px-4 py-2 font-medium">Type</th>
            <th className="px-4 py-2 font-medium">Default</th>
            <th className="px-4 py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.name}
              className={i === rows.length - 1 ? "" : "border-b"}
            >
              <td className="px-4 py-2 font-mono text-xs text-foreground">
                {row.name}
              </td>
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                {row.type}
              </td>
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                {row.default ?? "—"}
              </td>
              <td className="px-4 py-2 text-muted-foreground">
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
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

export default async function InputOTPDocsPage() {
  const manualSource = await loadManualSource()

  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-12 px-4 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to components
      </Link>

      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Input OTP</h1>
            <p className="text-muted-foreground">
              A one-time password input with individually boxed character
              slots, as an alternative to shadcn&apos;s default joined
              pill-style OTP.
            </p>
          </div>
          <OpenInV0Button name={REGISTRY_NAME} className="shrink-0" />
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Preview</h2>
        <ComponentPreview code={basicExampleCode}>
          <BasicDemo />
        </ComponentPreview>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Installation</h2>
        <InstallSection
          name={REGISTRY_NAME}
          deps={NPM_DEPENDENCIES}
          source={manualSource}
          sourcePath={MANUAL_TARGET_PATH}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Composition</h2>
        <p className="text-sm text-muted-foreground">
          Use the following composition to build an{" "}
          <code>InputOTP</code>:
        </p>
        <CodeBlock code={compositionCode} language="tsx" />
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-xl font-semibold tracking-tight">Examples</h2>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold tracking-tight">
              With separator
            </h3>
            <p className="text-sm text-muted-foreground">
              Split slots into groups with a visual separator.
            </p>
          </div>
          <ComponentPreview code={separatorExampleCode}>
            <SeparatorDemo />
          </ComponentPreview>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold tracking-tight">
              Digits only
            </h3>
            <p className="text-sm text-muted-foreground">
              Restrict input to numeric characters using the pattern prop.
            </p>
          </div>
          <ComponentPreview code={digitsExampleCode}>
            <DigitsOnlyDemo />
          </ComponentPreview>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold tracking-tight">Disabled</h3>
            <p className="text-sm text-muted-foreground">
              Non-interactive state for read-only or loading contexts.
            </p>
          </div>
          <ComponentPreview code={disabledExampleCode}>
            <DisabledDemo />
          </ComponentPreview>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold tracking-tight">API Reference</h2>

        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold tracking-tight">InputOTP</h3>
          <p className="text-sm text-muted-foreground">
            Root component. Accepts every prop from the underlying{" "}
            <code className="font-mono text-xs">OTPInput</code> in{" "}
            <code className="font-mono text-xs">input-otp</code> — the most
            relevant are listed below.
          </p>
          <PropsTable rows={inputOTPProps} />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold tracking-tight">
            InputOTPSlot
          </h3>
          <p className="text-sm text-muted-foreground">
            A single character slot. Renders the character, active ring, and
            blinking caret.
          </p>
          <PropsTable rows={inputOTPSlotProps} />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold tracking-tight">
            InputOTPGroup & InputOTPSeparator
          </h3>
          <p className="text-sm text-muted-foreground">
            Layout helpers.{" "}
            <code className="font-mono text-xs">InputOTPGroup</code> wraps
            related slots;{" "}
            <code className="font-mono text-xs">InputOTPSeparator</code>{" "}
            renders a dot between groups. Both forward standard{" "}
            <code className="font-mono text-xs">div</code> props.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Accessibility</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            Full keyboard navigation — typing, backspace, arrow keys, and
            paste all work as expected.
          </li>
          <li>
            Slots expose{" "}
            <code className="font-mono text-xs">data-active</code> for focus
            state and honor{" "}
            <code className="font-mono text-xs">aria-invalid</code> for error
            styling.
          </li>
          <li>
            The separator is rendered with{" "}
            <code className="font-mono text-xs">
              role=&quot;separator&quot;
            </code>{" "}
            so it is announced correctly.
          </li>
        </ul>
      </section>
    </div>
  )
}
