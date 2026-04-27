import { ReferenceRange } from "@/registry/new-york/blocks/reference-range/reference-range"

export default function EqualDistributionExample() {
  return (
    <div className="w-full max-w-md">
      <p className="mb-3 text-sm">hsCRP — equal segments</p>
      <ReferenceRange
        value={2.4}
        unit="mg/L"
        distribution="equal"
        ranges={[
          { start: 0, end: 1, color: "var(--range-5)" },
          { start: 1, end: 3, color: "var(--range-3)" },
          { start: 3, end: 10, color: "var(--range-1)" },
        ]}
      />
    </div>
  )
}
