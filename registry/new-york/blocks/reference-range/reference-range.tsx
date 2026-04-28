"use client"

import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/new-york/ui/tooltip"

export type ReferenceRangeItem = {
  start: number | null
  end: number | null
  color: string
  label?: string
}

export type PointerRenderContext = {
  value: number
  color: string
  percent: number
  range: ReferenceRangeItem
}

export type SegmentRenderContext = {
  range: ReferenceRangeItem
  index: number
  widthPercent: number
  isOpenStart: boolean
  isOpenEnd: boolean
}

export interface ReferenceRangeProps {
  ranges: ReferenceRangeItem[]
  value: number
  unit?: string
  distribution?: "proportional" | "equal"
  showValue?: boolean
  formatValue?: (v: number) => string
  formatTick?: (v: number) => string
  tickLabels?: "boundaries" | "none" | number[]
  renderPointer?: (ctx: PointerRenderContext) => React.ReactNode
  renderSegment?: (ctx: SegmentRenderContext) => React.ReactNode
  className?: string
}

// Boundary convention: [start, end) — start inclusive, end exclusive.
// The last range is [start, end] (inclusive on both sides since nothing follows).
const referenceRangeVariants = cva(["w-full"])

const identity = (v: number) => String(v)

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi)
}

function ReferenceRange({
  ranges,
  value,
  unit,
  distribution = "proportional",
  showValue = true,
  formatValue = identity,
  formatTick = identity,
  tickLabels = "boundaries",
  renderPointer,
  renderSegment,
  className,
}: ReferenceRangeProps) {
  if (process.env.NODE_ENV !== "production") {
    for (let i = 1; i < ranges.length; i++) {
      const prev = ranges[i - 1].end
      const curr = ranges[i].start
      if (prev != null && curr != null && prev !== curr) {
        // eslint-disable-next-line no-console
        console.warn(
          `[ReferenceRange] gap or overlap between ranges[${i - 1}].end (${prev}) and ranges[${i}].start (${curr}).`
        )
      }
    }
  }

  // Resolve visual bounds using avg closed-segment width as the baseline
  // for open-ended bookends.
  const closedWidths = ranges
    .map((r) => (r.start != null && r.end != null ? r.end - r.start : null))
    .filter((w): w is number => w != null)
  const avgClosedWidth = closedWidths.length
    ? closedWidths.reduce((a, b) => a + b, 0) / closedWidths.length
    : 1

  type Resolved = ReferenceRangeItem & {
    vStart: number
    vEnd: number
    isOpenStart: boolean
    isOpenEnd: boolean
  }

  const resolved: Resolved[] = ranges.map((r, i) => {
    const isOpenStart = r.start == null
    const isOpenEnd = r.end == null
    let vStart = r.start ?? 0
    let vEnd = r.end ?? 0
    if (isOpenStart) {
      const anchor = r.end ?? ranges[i + 1]?.start ?? 0
      vStart = anchor - avgClosedWidth
    }
    if (isOpenEnd) {
      const anchor = r.start ?? ranges[i - 1]?.end ?? 0
      vEnd = anchor + avgClosedWidth
    }
    return { ...r, vStart, vEnd, isOpenStart, isOpenEnd }
  })

  const initialMin = resolved[0].vStart
  const initialMax = resolved[resolved.length - 1].vEnd
  const initialSpan = Math.max(initialMax - initialMin, 1)

  // Stretch the bookend segments to fit values that overflow the declared
  // domain — applies to both open-ended bookends and closed ranges. Adds 5%
  // of the original span as breathing room past the value.
  if (value < resolved[0].vStart) {
    resolved[0] = {
      ...resolved[0],
      vStart: value - 0.05 * initialSpan,
    }
  }
  const lastIdx = resolved.length - 1
  if (value > resolved[lastIdx].vEnd) {
    resolved[lastIdx] = {
      ...resolved[lastIdx],
      vEnd: value + 0.03 * initialSpan,
    }
  }

  const domainMin = resolved[0].vStart
  const domainMax = resolved[lastIdx].vEnd
  const domainSpan = Math.max(domainMax - domainMin, 1)

  const findRangeIndex = (v: number) => {
    for (let i = 0; i < ranges.length; i++) {
      const r = ranges[i]
      const isFirst = i === 0
      const isLast = i === ranges.length - 1
      // Use the resolved (post-stretch) bounds for bookends so overflow values
      // map into the stretched first/last segment instead of returning -1.
      const lo = isFirst ? resolved[0].vStart : (r.start ?? -Infinity)
      const hi = isLast ? resolved[lastIdx].vEnd : (r.end ?? Infinity)
      if (v >= lo && (isLast ? v <= hi : v < hi)) return i
    }
    return -1
  }

  // Bar segments are laid out with a flex gap (gap-1 = 4px). The pointer and
  // ticks live in a sibling row that spans the same total width, so a pure
  // percent-of-domain mapping skews them off the visible segment boundaries by
  // half a gap. We express positions as a calc that mixes the bar-relative
  // fraction (% of bar-total) with the cumulative gap pixels before the value.
  const GAP_PX = 4
  const N = resolved.length

  const segmentFraction = (i: number) => {
    if (distribution === "equal") return 1 / N
    const seg = resolved[i]
    return (seg.vEnd - seg.vStart) / domainSpan
  }

  const valueToCumulativeFraction = (v: number) => {
    let idx = findRangeIndex(v)
    let local: number
    if (idx === -1) {
      if (v < resolved[0].vStart) {
        idx = 0
        local = 0
      } else {
        idx = N - 1
        local = 1
      }
    } else {
      const seg = resolved[idx]
      const segSpan = Math.max(seg.vEnd - seg.vStart, 1e-9)
      local = clamp((v - seg.vStart) / segSpan, 0, 1)
    }
    let frac = 0
    for (let j = 0; j < idx; j++) frac += segmentFraction(j)
    frac += local * segmentFraction(idx)
    return { frac, idx, local }
  }

  const valueToCalcLeft = (v: number) => {
    const { frac, idx, local } = valueToCumulativeFraction(v)
    // Boundary values (local === 0 with idx > 0, or local === 1 with idx < N-1)
    // sit in the visual gap between adjacent segments. Center them in the gap
    // so a tick or pointer at the boundary aligns with the gap, not the edge
    // of the next bar.
    let gapOffset = idx * GAP_PX
    if (local === 0 && idx > 0) gapOffset -= GAP_PX / 2
    else if (local === 1 && idx < N - 1) gapOffset += GAP_PX / 2
    return `calc(${frac * 100}% - ${frac * (N - 1) * GAP_PX}px + ${gapOffset}px)`
  }

  const pointerIndex = clamp(findRangeIndex(value), 0, ranges.length - 1)
  const pointerRange = ranges[pointerIndex]
  const pointerColor = pointerRange.color
  const pointerLeft = valueToCalcLeft(value)
  const pointerPercent = valueToCumulativeFraction(value).frac * 100

  let ticks: number[] = []
  if (tickLabels === "boundaries") {
    const set = new Set<number>()
    for (const r of ranges) {
      if (r.start != null) set.add(r.start)
      if (r.end != null) set.add(r.end)
    }
    const first = ranges[0]
    const last = ranges[ranges.length - 1]
    if (first.start != null) set.delete(first.start)
    if (last.end != null) set.delete(last.end)
    ticks = [...set].sort((a, b) => a - b)
  } else if (Array.isArray(tickLabels)) {
    ticks = [...tickLabels].sort((a, b) => a - b)
  }

  // Edge clamping for the value label: keep the triangle at the true
  // pointer position, but clamp the value text so its bounding box never
  // crosses the container's edges. Implemented as CSS `clamp()` against
  // a `--ref-halfw` custom property holding half the label's measured
  // width, updated by a ResizeObserver. The browser handles edge math
  // during paint — no JS on viewport resize.
  const headerRef = React.useRef<HTMLDivElement>(null)
  const valueRef = React.useRef<HTMLSpanElement>(null)
  React.useLayoutEffect(() => {
    const header = headerRef.current
    const label = valueRef.current
    if (!header || !label) return
    const update = () => {
      const w = label.getBoundingClientRect().width
      header.style.setProperty("--ref-halfw", `${w / 2}px`)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(label)
    return () => ro.disconnect()
  }, [showValue, renderPointer])

  const clampedValueLeft = `clamp(var(--ref-halfw), ${pointerLeft}, calc(100% - var(--ref-halfw)))`

  return (
    <div className={cn(referenceRangeVariants(), className)}>
      <div
        ref={headerRef}
        className="relative w-full"
        style={{
          height: showValue || renderPointer ? "1.75rem" : "0.625rem",
          ["--ref-halfw" as string]: "16px",
        }}
      >
        {!renderPointer && showValue && (
          <span
            ref={valueRef}
            className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-muted-foreground"
            style={{ left: clampedValueLeft }}
          >
            {formatValue(value)}
            {unit ? <span className="ml-1">{unit}</span> : null}
          </span>
        )}
        <div
          className="absolute -bottom-0.5 flex -translate-x-1/2 flex-col items-center"
          style={{ left: pointerLeft }}
        >
          {renderPointer ? (
            renderPointer({
              value,
              color: pointerColor,
              percent: pointerPercent,
              range: pointerRange,
            })
          ) : (
            <svg
              aria-hidden
              viewBox="0 0 14 11"
              preserveAspectRatio="none"
              className="block w-[20px] h-[16px] translate-y-[2px]"
            >
              <path
                d="M4 2 L10 2 Q12 2 10.84 3.63 L8.16 7.37 Q7 9 5.84 7.37 L3.16 3.63 Q2 2 4 2 Z"
                fill={pointerColor}
                stroke="var(--background)"
                strokeWidth="3"
                strokeLinejoin="round"
                paintOrder="stroke"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )}
        </div>
      </div>

      <TooltipProvider>
        <div
          className="flex w-full gap-1"
          role="img"
          aria-label={`Reference range with current value ${formatValue(value)}${unit ? ` ${unit}` : ""}.`}
        >
          {resolved.map((r, i) => {
            const widthPercent =
              distribution === "equal"
                ? 100 / resolved.length
                : ((r.vEnd - r.vStart) / domainSpan) * 100
            const flexBasis =
              distribution === "equal" ? 1 : Math.max(r.vEnd - r.vStart, 0.0001)
            if (renderSegment) {
              return (
                <React.Fragment key={i}>
                  {renderSegment({
                    range: ranges[i],
                    index: i,
                    widthPercent,
                    isOpenStart: r.isOpenStart,
                    isOpenEnd: r.isOpenEnd,
                  })}
                </React.Fragment>
              )
            }
            const segment = (
              <div
                className="h-2.5 rounded-full"
                style={{
                  flex: flexBasis,
                  backgroundColor: r.color,
                }}
              />
            )
            if (!r.label) {
              return <React.Fragment key={i}>{segment}</React.Fragment>
            }
            return (
              <Tooltip key={i}>
                <TooltipTrigger asChild>{segment}</TooltipTrigger>
                <TooltipContent>{r.label}</TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </TooltipProvider>

      {tickLabels !== "none" && ticks.length > 0 && (
        <div className="relative mt-1.5 h-4 w-full">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute -translate-x-1/2 text-xs leading-none text-muted-foreground"
              style={{ left: valueToCalcLeft(t) }}
            >
              {formatTick(t)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export { ReferenceRange, referenceRangeVariants }
