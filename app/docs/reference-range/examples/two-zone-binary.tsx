import { ReferenceRange } from "@/registry/new-york/blocks/reference-range/reference-range"

export default function TwoZoneBinaryExample() {
  return (
    <div className="w-full max-w-md">
      <p className="mb-3 text-sm">Battery health</p>
      <ReferenceRange
        value={72}
        unit="%"
        ranges={[
          { start: 0, end: 80, color: "var(--range-2)" },
          { start: 80, end: 100, color: "var(--range-5)" },
        ]}
      />
    </div>
  )
}
