"use client"

import { ReferenceRange } from "@/registry/new-york/blocks/reference-range/reference-range"

const fgByBg: Record<string, string> = {
  "var(--range-1)": "var(--range-1-fg)",
  "var(--range-3)": "var(--range-3-fg)",
  "var(--range-4)": "var(--range-4-fg)",
  "var(--range-5)": "var(--range-5-fg)",
}

export default function CustomPointerExample() {
  return (
    <div className="w-full max-w-md">
      <p className="mb-3 text-sm">Credit score</p>
      <ReferenceRange
        value={590}
        ranges={[
          { start: 300, end: 580, color: "var(--range-1)" },
          { start: 580, end: 670, color: "var(--range-3)" },
          { start: 670, end: 740, color: "var(--range-4)" },
          { start: 740, end: 800, color: "var(--range-5)" },
          { start: 800, end: 850, color: "var(--range-5)" },
        ]}
        renderPointer={({ value, color }) => (
          <div className="mb-2 flex flex-col items-center gap-[1px]">
            <span
              className="rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: color, color: fgByBg[color] }}
            >
              {value}
            </span>
            <svg
              aria-hidden
              viewBox="0 0 14 11"
              preserveAspectRatio="none"
              className="block h-[16px] w-[20px]"
            >
              <path
                d="M4 2 L10 2 Q12 2 10.84 3.63 L8.16 7.37 Q7 9 5.84 7.37 L3.16 3.63 Q2 2 4 2 Z"
                fill={color}
              />
            </svg>
          </div>
        )}
      />
    </div>
  )
}
