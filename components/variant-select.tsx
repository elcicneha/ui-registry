"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useDocsVariant,
  type DocsVariant,
} from "@/components/docs-variant-context"

const VARIANT_OPTIONS: { value: DocsVariant; label: string }[] = [
  { value: "boxed", label: "Boxed" },
  { value: "joined", label: "Joined" },
]

export function VariantSelect() {
  const { variant, setVariant } = useDocsVariant()

  return (
    <Select value={variant} onValueChange={(v) => setVariant(v as DocsVariant)}>
      <SelectTrigger size="sm">
        <span className="text-muted-foreground">Variant</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {VARIANT_OPTIONS.map(({ value, label }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
