import * as React from "react"
import fs from "node:fs/promises"
import path from "node:path"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { ComponentPreview } from "@/components/component-preview"
import { DocExample } from "@/components/doc-example"
import { InstallSection } from "@/components/install-section"
import { OpenInV0Button } from "@/components/open-in-v0-button"
import { loadExampleSource } from "@/lib/docs"
import BasicExample from "./examples/basic"
import ControlledExample from "./examples/controlled"
import DefaultCountryExample from "./examples/default-country"
import OneCountryExample from "./examples/one-country"

const REGISTRY_NAME = "input-phone"
const MANUAL_TARGET_PATH = "components/ui/input-phone.tsx"
const REGISTRY_SOURCE_PATH =
  "registry/new-york/blocks/input-phone/input-phone.tsx"
const NPM_DEPENDENCIES = ["react-phone-number-input"]

type PropRow = {
  name: string
  type: string
  default?: string
  description: string
}

const inputPhoneProps: PropRow[] = [
  {
    name: "value",
    type: "string",
    description:
      "Controlled phone number value in E.164 format (e.g. +12025550123).",
  },
  {
    name: "onChange",
    type: "(value: Value) => void",
    description:
      "Called whenever the value changes. Receives the E.164 string or an empty string when cleared.",
  },
  {
    name: "defaultCountry",
    type: "Country",
    default: '"US"',
    description:
      "ISO 3166-1 alpha-2 country code shown by default before the user selects a country.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Disables both the country picker and the phone number field.",
  },
  {
    name: "placeholder",
    type: "string",
    description: "Placeholder text for the phone number input field.",
  },
  {
    name: "international",
    type: "boolean",
    default: "false",
    description:
      "When true, always formats the number in international format with the calling code prefix.",
  },
  {
    name: "countries",
    type: "Country[]",
    description:
      "Restrict the country picker to a subset of countries. Pass a single-item array to hide the picker entirely.",
  },
  {
    name: "className",
    type: "string",
    description: "Extra classes merged onto the outer wrapper element.",
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

export default async function InputPhoneDocsPage() {
  const [
    manualSource,
    basicCode,
    controlledCode,
    defaultCountryCode,
    oneCountryCode,
  ] = await Promise.all([
    loadManualSource(),
    loadExampleSource("app/docs/input-phone/examples/basic.tsx"),
    loadExampleSource("app/docs/input-phone/examples/controlled.tsx"),
    loadExampleSource("app/docs/input-phone/examples/default-country.tsx"),
    loadExampleSource("app/docs/input-phone/examples/one-country.tsx"),
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
            <h1 className="text-3xl font-bold tracking-tight">Input Phone</h1>
            <p className="text-muted-foreground">
              Phone number input with a searchable country picker, backed by{" "}
              <code className="font-mono text-sm">
                react-phone-number-input
              </code>
              . Outputs E.164 formatted values.
            </p>
          </div>
          <OpenInV0Button name={REGISTRY_NAME} className="shrink-0" />
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Preview</h2>
        <ComponentPreview code={basicCode}>
          <BasicExample />
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

      <section className="flex flex-col gap-8">
        <h2 className="text-xl font-semibold tracking-tight">Examples</h2>

        <DocExample
          title="Controlled"
          description={<>Pass <code>value</code> and <code>onChange</code> to keep the
            phone number in your own state. This lets you read the number at
            any time — useful when you need to validate it, send it in a form,
            or show it somewhere else on the page. The value you get back is
            always in E.164 format (e.g. <code>+12025550123</code>), which is
            the standard format for storing and sending phone numbers.</>}
          code={controlledCode}
        >
          <ControlledExample />
        </DocExample>

        <DocExample
          title="Default country"
          description={<>Set the initially selected country with{" "}
            <code className="font-mono text-xs">defaultCountry</code>. Users
            can still switch to any other country via the picker.</>}
          code={defaultCountryCode}
        >
          <DefaultCountryExample />
        </DocExample>

        <DocExample
          title="One country only"
          description={<>Restrict the country picker to a single country by passing a
            single-item array to the <code>countries</code> prop. The
            country picker UI will not appear.</>}
          code={oneCountryCode}
        >
          <OneCountryExample />
        </DocExample>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold tracking-tight">API Reference</h2>

        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold tracking-tight">InputPhone</h3>
          <p className="text-sm text-muted-foreground">
            A single component that wraps{" "}
            <code className="font-mono text-xs">react-phone-number-input</code>
            . It accepts all props from{" "}
            <code className="font-mono text-xs">RPNInput.Props</code> except{" "}
            <code className="font-mono text-xs">onChange</code>, which is
            re-typed to receive an E.164{" "}
            <code className="font-mono text-xs">Value</code> string. The most
            commonly used props are listed below.
          </p>
          <PropsTable rows={inputPhoneProps} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Accessibility</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            The country picker button is keyboard-focusable and opens a
            searchable{" "}
            <code className="font-mono text-xs">Command</code> popover — type
            to filter, use arrow keys to navigate, press{" "}
            <kbd className="rounded border px-1 font-mono text-xs">Enter</kbd>{" "}
            to select.
          </li>
          <li>
            The outer wrapper uses a{" "}
            <code className="font-mono text-xs">focus-within</code> ring so the
            full control receives a visible focus indicator regardless of which
            inner element is focused.
          </li>
          <li>
            The wrapper forwards{" "}
            <code className="font-mono text-xs">aria-invalid</code> for error
            state styling — pair it with a visible error message associated via{" "}
            <code className="font-mono text-xs">aria-describedby</code> on the
            wrapping field.
          </li>
          <li>
            Country flags are rendered as SVGs with a{" "}
            <code className="font-mono text-xs">title</code> attribute
            containing the country name, so screen readers announce the current
            country selection.
          </li>
        </ul>
      </section>
    </div>
  )
}
