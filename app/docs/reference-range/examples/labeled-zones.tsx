import { ReferenceRange } from "@/registry/new-york/blocks/reference-range/reference-range"

export default function LabeledZonesExample() {
  return (
    <div className="w-full max-w-md">
      <p className="mb-3 text-sm">Battery health</p>
      <ReferenceRange
        value={78}
        unit="%"
        tickLabels={[50, 70, 85]}
        ranges={[
          { start: 0, end: 50, color: "var(--range-1)", label: "Failing" },
          { start: 50, end: 70, color: "var(--range-2)", label: "Degraded" },
          { start: 70, end: 85, color: "var(--range-3)", label: "Fair" },
          { start: 85, end: 100, color: "var(--range-5)", label: "Healthy" },
        ]}
      />
    </div>
  )
}
