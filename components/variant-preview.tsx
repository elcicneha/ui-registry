"use client"

import * as React from "react"

import {
  useDocsVariant,
  type DocsVariant,
} from "@/components/docs-variant-context"

type VariantAwareProps = { variant: DocsVariant }

export function VariantExample({
  Example,
}: {
  Example: React.ComponentType<VariantAwareProps>
}) {
  const { variant } = useDocsVariant()
  return <Example variant={variant} />
}
