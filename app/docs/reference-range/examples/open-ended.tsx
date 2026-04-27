import { ReferenceRange } from "@/registry/new-york/blocks/reference-range/reference-range"

export default function OpenEndedExample() {
  return (
    <div className="w-full max-w-md">
      <p className="mb-3 text-sm">LDL Cholesterol</p>
      <ReferenceRange
        value={185}
        unit="mg/dL"
        ranges={[
          { start: null, end: 100, color: "var(--range-5)", label: "Optimal" },
          { start: 100, end: 130, color: "var(--range-4)", label: "Near optimal" },
          { start: 130, end: 160, color: "var(--range-3)", label: "Borderline" },
          { start: 160, end: 190, color: "var(--range-2)", label: "High" },
          { start: 190, end: null, color: "var(--range-1)", label: "Very high" },
        ]}
      />
    </div>
  )
}
