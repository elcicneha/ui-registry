import * as React from "react"
import fs from "node:fs/promises"
import path from "node:path"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { ComponentPreview } from "@/components/component-preview"
import { DocExample } from "@/components/doc-example"
import { InstallSection } from "@/components/install-section"
import { OpenInV0Button } from "@/components/open-in-v0-button"
import { PropsTable, type PropRow } from "@/components/props-table"
import { loadExampleSource } from "@/lib/docs"
import { makeCliCommands } from "@/lib/registry"
import BasicExample from "./examples/basic"
import ControlledExample from "./examples/controlled"
import DefaultCountryExample from "./examples/default-country"
import OneCountryExample from "./examples/one-country"

const REGISTRY_NAME = "input-phone"
const MANUAL_TARGET_PATH = "components/ui/input-phone.tsx"
const REGISTRY_SOURCE_PATH =
  "registry/new-york/blocks/input-phone/input-phone.tsx"
const NPM_DEPENDENCIES = ["react-phone-number-input"]

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
            <h1>Input Phone</h1>
            <p>
              Phone number input with a searchable country picker, backed by{" "}
              <code className="font-mono text-sm">
                react-phone-number-input
              </code>
              . Outputs E.164 formatted values.
            </p>
          </div>
          <OpenInV0Button name={REGISTRY_NAME} />
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2>Preview</h2>
        <ComponentPreview code={basicCode}>
          <BasicExample />
        </ComponentPreview>
      </section>

      <section className="flex flex-col gap-4">
        <h2>Installation</h2>
        <InstallSection
          cliCommands={makeCliCommands(REGISTRY_NAME)}
          deps={NPM_DEPENDENCIES}
          source={manualSource}
          sourcePath={MANUAL_TARGET_PATH}
        />
      </section>

      <section className="flex flex-col gap-8">
        <h2>Examples</h2>
        <div className="flex flex-col gap-12">
          <DocExample
            title="Controlled"
            description={<>Use the <code>value</code> and <code>onChange</code> props to control the input value.</>}
            code={controlledCode}
          >
            <ControlledExample />
          </DocExample>

          <DocExample
            title="Default country"
            description={<>Set the initially selected country with{" "}
              <code>defaultCountry</code>. Users
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
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2>API Reference</h2>

        <div className="flex flex-col gap-3">
          <h3>InputPhone</h3>
          <p>
            A single component that wraps{" "}
            <code>react-phone-number-input</code>
            . It accepts all props from{" "}
            <code>RPNInput.Props</code> except{" "}
            <code>onChange</code>, which is
            re-typed to receive an E.164{" "}
            <code>Value</code> string. The most
            commonly used props are listed below.
          </p>
          <PropsTable rows={inputPhoneProps} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Accessibility</h2>
        <ul >
          <li>
            The country picker button is keyboard-focusable and opens a
            searchable{" "}
            <code>Command</code> popover — type
            to filter, use arrow keys to navigate, press{" "}
            <kbd>Enter</kbd>{" "}
            to select.
          </li>
          <li>
            The outer wrapper uses a{" "}
            <code>focus-within</code> ring so the
            full control receives a visible focus indicator regardless of which
            inner element is focused.
          </li>
          <li>
            The wrapper forwards{" "}
            <code>aria-invalid</code> for error
            state styling — pair it with a visible error message associated via{" "}
            <code>aria-describedby</code> on the
            wrapping field.
          </li>
          <li>
            Country flags are rendered as SVGs with a{" "}
            <code>title</code> attribute
            containing the country name, so screen readers announce the current
            country selection.
          </li>
        </ul>
      </section>
    </div>
  )
}
