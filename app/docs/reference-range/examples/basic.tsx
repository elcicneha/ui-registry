import { ReferenceRange } from "@/registry/new-york/blocks/reference-range/reference-range"

export default function BasicExample() {
  return (
    <div className="w-full max-w-md">
      <ReferenceRange
        value={130}
        unit="mg/dL"
        ranges={[
          { start: 0, end: 20, color: "var(--range-1)" },
          { start: 20, end: 80, color: "var(--range-4)" },
          { start: 80, end: 110, color: "var(--range-5)" },
          { start: 110, end: 200, color: "var(--range-3)" },
          { start: 200, end: 250, color: "var(--range-2)" },
        ]}
      />
    </div>
  )
}
