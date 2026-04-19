"use client"

import * as React from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useDocsVariant,
  type DocsVariant,
} from "@/components/docs-variant-context"

export function DocsVariantToggle({
  options,
  label = "Variant",
}: {
  options: { value: DocsVariant; label: string }[]
  label?: string
}) {
  const { variant, setVariant } = useDocsVariant()

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <Tabs
        value={variant}
        onValueChange={(value) => setVariant(value as DocsVariant)}
      >
        <TabsList>
          {options.map((option) => (
            <TabsTrigger key={option.value} value={option.value}>
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
