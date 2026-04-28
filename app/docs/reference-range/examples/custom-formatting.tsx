"use client"

import { ReferenceRange } from "@/registry/new-york/blocks/reference-range/reference-range"

const formatMs = (v: number) => (v >= 1000 ? `${v / 1000}s` : `${v}ms`)

export default function CustomFormattingExample() {
  return (
    <div className="w-full max-w-md">
      <p className="mb-3 text-sm">API response time</p>
      <ReferenceRange
        value={1240}
        formatValue={formatMs}
        formatTick={formatMs}
        ranges={[
          { start: 0, end: 200, color: "var(--range-5)" },
          { start: 200, end: 500, color: "var(--range-4)" },
          { start: 500, end: 1000, color: "var(--range-3)" },
          { start: 1000, end: 3000, color: "var(--range-2)" },
          { start: 3000, end: null, color: "var(--range-1)" },
        ]}
      />
    </div>
  )
}
