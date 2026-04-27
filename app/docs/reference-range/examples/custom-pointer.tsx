import { ReferenceRange } from "@/registry/new-york/blocks/reference-range/reference-range"

export default function CustomPointerExample() {
  return (
    <div className="w-full max-w-md">
      <p className="mb-3 text-sm">Credit score</p>
      <ReferenceRange
        value={742}
        ranges={[
          { start: 300, end: 580, color: "var(--range-1)" },
          { start: 580, end: 670, color: "var(--range-3)" },
          { start: 670, end: 740, color: "var(--range-4)" },
          { start: 740, end: 800, color: "var(--range-5)" },
          { start: 800, end: 850, color: "var(--range-5)" },
        ]}
        renderPointer={({ value, color }) => (
          <span
            className="mb-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums text-white shadow-sm"
            style={{ backgroundColor: color }}
          >
            {value}
          </span>
        )}
      />
    </div>
  )
}
