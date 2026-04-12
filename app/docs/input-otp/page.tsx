import * as React from "react"
import fs from "node:fs/promises"
import path from "node:path"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { CodeBlock } from "@/components/code-block"
import { ComponentPreview } from "@/components/component-preview"
import { DocExample } from "@/components/doc-example"
import { InstallSection } from "@/components/install-section"
import { OpenInV0Button } from "@/components/open-in-v0-button"
import { PropsTable, type PropRow } from "@/components/props-table"
import { loadExampleSource } from "@/lib/docs"
import BasicExample from "./examples/basic"
import SeparatorExample from "./examples/separator"
import DigitsOnlyExample from "./examples/digits-only"
import DisabledExample from "./examples/disabled"
import ControlledExample from "./examples/controlled"
import InvalidExample from "./examples/invalid"
import AlphanumericExample from "./examples/alphanumeric"

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
  const [
    manualSource,
    basicCode,
    separatorCode,
    digitsOnlyCode,
    disabledCode,
    controlledCode,
    invalidCode,
    alphanumericCode,
  ] = await Promise.all([
    loadManualSource(),
    loadExampleSource("app/docs/input-otp/examples/basic.tsx"),
    loadExampleSource("app/docs/input-otp/examples/separator.tsx"),
    loadExampleSource("app/docs/input-otp/examples/digits-only.tsx"),
    loadExampleSource("app/docs/input-otp/examples/disabled.tsx"),
    loadExampleSource("app/docs/input-otp/examples/controlled.tsx"),
    loadExampleSource("app/docs/input-otp/examples/invalid.tsx"),
    loadExampleSource("app/docs/input-otp/examples/alphanumeric.tsx"),
  ])

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
            <h1>Input OTP</h1>
            <p>
              A one-time password input with individually boxed character
              slots, as an alternative to shadcn&apos;s default joined
              pill-style OTP.
            </p>
          </div>
          <OpenInV0Button name={REGISTRY_NAME} />
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 >Preview</h2>
        <ComponentPreview code={basicCode}>
          <BasicExample />
        </ComponentPreview>
      </section>

      <section className="flex flex-col gap-4">
        <h2 >Installation</h2>
        <InstallSection
          name={REGISTRY_NAME}
          deps={NPM_DEPENDENCIES}
          source={manualSource}
          sourcePath={MANUAL_TARGET_PATH}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 >Composition</h2>
        <p>
          Use the following composition to build an{" "}
          <code>InputOTP</code>:
        </p>
        <CodeBlock code={compositionCode} language="tsx" />
      </section>

      <section className="flex flex-col gap-8">
        <h2>Examples</h2>

        <div className="flex flex-col gap-12">
          <DocExample
            title="With separator"
            description="Split slots into groups with a visual separator."
            code={separatorCode}
          >
            <SeparatorExample />
          </DocExample>

          <DocExample
            title="Digits only"
            description="Restrict input to numeric characters using the pattern prop."
            code={digitsOnlyCode}
          >
            <DigitsOnlyExample />
          </DocExample>

          <DocExample
            title="Disabled"
            description="Non-interactive state for read-only or loading contexts."
            code={disabledCode}
          >
            <DisabledExample />
          </DocExample>

          <DocExample
            title="Controlled"
            description="Bind value and onChange to track the OTP in your own state. The live value is displayed below the input."
            code={controlledCode}
          >
            <ControlledExample />
          </DocExample>

          <DocExample
            title="Invalid"
            description="Pass aria-invalid to each InputOTPSlot to show the error styles. Fill all six slots to see the destructive state."
            code={invalidCode}
          >
            <InvalidExample />
          </DocExample>

          <DocExample
            title="Alphanumeric"
            description="Accept both letters and digits by passing the REGEXP_ONLY_DIGITS_AND_CHARS pattern. Special characters are rejected."
            code={alphanumericCode}
          >
            <AlphanumericExample />
          </DocExample>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2>API Reference</h2>

        <div className="flex flex-col gap-3">
          <h3>InputOTP</h3>
          <p >
            Root component. Accepts every prop from the underlying{" "}
            <code>OTPInput</code> in{" "}
            <code>input-otp</code> — the most
            relevant are listed below.
          </p>
          <PropsTable rows={inputOTPProps} />
        </div>

        <div className="flex flex-col gap-3">
          <h3>
            InputOTPSlot
          </h3>
          <p >
            A single character slot. Renders the character, active ring, and
            blinking caret.
          </p>
          <PropsTable rows={inputOTPSlotProps} />
        </div>

        <div className="flex flex-col gap-3">
          <h3>
            InputOTPGroup & InputOTPSeparator
          </h3>
          <p>
            Layout helpers.{" "}
            <code>InputOTPGroup</code> wraps
            related slots;{" "}
            <code>InputOTPSeparator</code>{" "}
            renders a dot between groups. Both forward standard{" "}
            <code>div</code> props.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Accessibility</h2>
        <ul >
          <li>
            Full keyboard navigation — typing, backspace, arrow keys, and
            paste all work as expected.
          </li>
          <li>
            Slots expose{" "}
            <code>data-active</code> for focus
            state and honor{" "}
            <code>aria-invalid</code> for error
            styling.
          </li>
          <li>
            The separator is rendered with{" "}
            <code>
              role=&quot;separator&quot;
            </code>{" "}
            so it is announced correctly.
          </li>
        </ul>
      </section>
    </div>
  )
}
