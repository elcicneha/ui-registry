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

// Pointer geometry shared between the rendered SVG and the bar's mask cutout.
// These constants are the single source of truth — the pointer's wrapper
// position and the mask cutout's position are both derived from them, so
// editing one of these moves both visuals in lock-step.
const POINTER_PATH_D =
  "M4 2 L10 2 Q12 2 10.84 3.63 L8.16 7.37 Q7 9 5.84 7.37 L3.16 3.63 Q2 2 4 2 Z"
const POINTER_VIEWBOX = "0 0 14 11"
const POINTER_W = 20
const POINTER_H = 16
// Vertical offset of the pointer SVG's top relative to the bar's top edge (px).
// Negative = pointer lifts above the bar; positive = pointer sinks into it.
// Tweak this to retune how deep the pointer slots into the bar.
const POINTER_Y = -10
// Visible gap between the pointer fill and the surrounding bar segment (px).
// This is the "stroke width equivalent" — tune it to make the halo tighter
// or looser. Converted to viewBox units below for the SVG stroke.
const POINTER_GAP_PX = 2
// SVG stroke is centered on the path edge, so a desired outset of GAP_PX
// needs a stroke of 2*GAP_PX in render space. The cutout SVG uses
// preserveAspectRatio='none' so the stroke stretches non-uniformly; we
// approximate with the average of x and y scale — close enough given the
// path is mostly curved/diagonal.
const POINTER_CUTOUT_STROKE =
  (2 * POINTER_GAP_PX) / ((POINTER_W / 14 + POINTER_H / 11) / 2)

const POINTER_CUTOUT_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${POINTER_VIEWBOX}' width='${POINTER_W}' height='${POINTER_H}' preserveAspectRatio='none'><path d='${POINTER_PATH_D}' fill='white' stroke='white' stroke-width='${POINTER_CUTOUT_STROKE}' stroke-linejoin='round' paint-order='stroke'/></svg>`
const POINTER_CUTOUT_URI = `url("data:image/svg+xml;utf8,${encodeURIComponent(POINTER_CUTOUT_SVG)}")`

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

  const valueToCalcLeft = (v: number, offsetPx = 0) => {
    const { frac, idx, local } = valueToCumulativeFraction(v)
    // Boundary values (local === 0 with idx > 0, or local === 1 with idx < N-1)
    // sit in the visual gap between adjacent segments. Center them in the gap
    // so a tick or pointer at the boundary aligns with the gap, not the edge
    // of the next bar.
    let gapOffset = idx * GAP_PX
    if (local === 0 && idx > 0) gapOffset -= GAP_PX / 2
    else if (local === 1 && idx < N - 1) gapOffset += GAP_PX / 2
    const pxPart = -frac * (N - 1) * GAP_PX + gapOffset + offsetPx
    const sign = pxPart >= 0 ? "+" : "-"
    return `calc(${frac * 100}% ${sign} ${Math.abs(pxPart)}px)`
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
  const barRef = React.useRef<HTMLDivElement>(null)
  const [barWidth, setBarWidth] = React.useState(0)
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

  // Measure the bar's pixel width so the mask cutout can be positioned in
  // pure pixels — `mask-position` interprets percentages via an alignment
  // rule that doesn't compose cleanly with calc, so we sidestep it.
  React.useLayoutEffect(() => {
    const bar = barRef.current
    if (!bar) return
    const update = () => setBarWidth(bar.getBoundingClientRect().width)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(bar)
    return () => ro.disconnect()
  }, [])

  const cutoutFracInfo = valueToCumulativeFraction(value)
  let cutoutGapOffset = cutoutFracInfo.idx * GAP_PX
  if (cutoutFracInfo.local === 0 && cutoutFracInfo.idx > 0)
    cutoutGapOffset -= GAP_PX / 2
  else if (
    cutoutFracInfo.local === 1 &&
    cutoutFracInfo.idx < N - 1
  )
    cutoutGapOffset += GAP_PX / 2
  const cutoutLeftPx =
    barWidth * cutoutFracInfo.frac -
    cutoutFracInfo.frac * (N - 1) * GAP_PX +
    cutoutGapOffset -
    POINTER_W / 2

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
          className="absolute flex -translate-x-1/2 flex-col items-center"
          style={{
            left: pointerLeft,
            // Wrapper's bottom is derived from POINTER_Y so the SVG top lands
            // exactly POINTER_Y px from the bar's top edge — same coord that
            // drives the mask cutout.
            bottom: -(POINTER_H + POINTER_Y),
          }}
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
              viewBox={POINTER_VIEWBOX}
              preserveAspectRatio="none"
              width={POINTER_W}
              height={POINTER_H}
              className="block"
            >
              <path d={POINTER_PATH_D} fill={pointerColor} />
            </svg>
          )}
        </div>
      </div>

      <TooltipProvider>
        <div
          ref={barRef}
          className="flex w-full gap-1"
          role="img"
          aria-label={`Reference range with current value ${formatValue(value)}${unit ? ` ${unit}` : ""}.`}
          style={
            renderPointer
              ? undefined
              : {
                // Cut a pointer-shaped notch out of the top of the bar at
                // pointerLeft so the page/card backdrop shows through —
                // gives a background-agnostic gap around the pointer tip
                // without needing a stroke painted in --background.
                // Two layers composited via subtract: full-opaque white
                // (top) minus the pointer cutout (bottom). Layer order is
                // load-bearing — `subtract` keeps the top layer where the
                // bottom is transparent, so the pointer must be listed last.
                WebkitMaskImage: `linear-gradient(#fff, #fff), ${POINTER_CUTOUT_URI}`,
                WebkitMaskPosition: `left 0 top 0, ${cutoutLeftPx}px ${POINTER_Y}px`,
                WebkitMaskSize: `100% 100%, ${POINTER_W}px ${POINTER_H}px`,
                WebkitMaskRepeat: "no-repeat, no-repeat",
                WebkitMaskComposite: "source-out",
                maskImage: `linear-gradient(#fff, #fff), ${POINTER_CUTOUT_URI}`,
                maskPosition: `left 0 top 0, ${cutoutLeftPx}px ${POINTER_Y}px`,
                maskSize: `100% 100%, ${POINTER_W}px ${POINTER_H}px`,
                maskRepeat: "no-repeat, no-repeat",
                maskComposite: "subtract",
              }
          }
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
