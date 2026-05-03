import { ReferenceRange } from "@/registry/new-york/blocks/reference-range/reference-range"

import type {
  ReferenceRangeFirst,
  ReferenceRangeRest,
} from "@/registry/new-york/blocks/reference-range/reference-range"

// TSH (thyroid-stimulating hormone) reference ranges. The "hyperthyroid"
// zone is just 0–0.4 mIU/L inside a clinically relevant 0–20 domain —
// roughly 2% of the bar. With proportional sizing it renders as a sliver
// that's hard to read and impossible to hover for the tooltip.
const ranges: [ReferenceRangeFirst, ...ReferenceRangeRest[]] = [
  { start: 0, end: 0.4, color: "var(--range-2)", label: "Hyperthyroid" },
  { end: 4, color: "var(--range-3)", label: "Normal" },
  { end: 25, color: "var(--range-4)", label: "Mild hypothyroid" },
  { end: 30, color: "var(--range-5)", label: "Severe hypothyroid" },
]

export default function MinSegmentWidthExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div>
        <p className="mb-3 text-sm">Without minimum width</p>
        <ReferenceRange
          value={0.2}
          unit="mIU/L"
          minSegmentWidth={0}
          ranges={ranges}
        />
      </div>
      <div>
        <p className="mb-3 text-sm">With minimum width (default)</p>
        <ReferenceRange value={0.2} unit="mIU/L" ranges={ranges} />
      </div>
    </div>
  )
}
