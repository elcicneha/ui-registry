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

/** First segment in a ranges array — `start` is required (use `null` for open-ended). */
export type ReferenceRangeFirst = {
  start: number | null
  end: number | null
  color: string
  label?: string
}

/**
 * Any segment after the first — `start` is derived from the previous segment's `end`
 * and should be omitted. You may provide it as an explicit assertion; the component
 * will throw if it doesn't match.
 */
export type ReferenceRangeRest = {
  start?: number | null
  end: number | null
  color: string
  label?: string
}

/** Union of both segment shapes — use `ReferenceRangeFirst` / `ReferenceRangeRest` when
 *  you need to reference a specific position. */
export type ReferenceRangeItem = ReferenceRangeFirst | ReferenceRangeRest

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
  /**
   * Ordered list of range segments from left to right.
   *
   * Only the **first** segment requires `start` (use `null` for open-ended left).
   * Every subsequent segment derives its start from the previous segment's `end` —
   * omit `start` entirely for cleaner code. Providing `start` on a later segment is
   * treated as an assertion and throws if it doesn't match.
   *
   * @example
   * // Basic closed ranges — only the first segment sets `start`:
   * [
   *   { start: 0,    end: 18.5, color: "#22c55e", label: "Underweight" },
   *   {               end: 25,   color: "#84cc16", label: "Normal"      },
   *   {               end: 30,   color: "#eab308", label: "Overweight"  },
   *   {               end: null, color: "#ef4444", label: "Obese"       },
   * ]
   *
   * @example
   * // Open-ended on both sides:
   * [
   *   { start: null, end: 18.5, color: "#22c55e" },
   *   {               end: 25,  color: "#84cc16"  },
   *   {               end: null, color: "#ef4444" },
   * ]
   */
  ranges: [ReferenceRangeFirst, ...ReferenceRangeRest[]]
  value: number
  unit?: string
  distribution?: "proportional" | "equal"
  /**
   * Minimum rendered width per segment. Accepts any CSS length string
   * (`"1.5rem"`, `"24px"`, `"2em"`, `"5%"`, `"clamp(...)"`, etc.) or a
   * number (interpreted as pixels). The string is resolved to its actual
   * pixel value at runtime so `em`/`rem`/`%` honor the consumer's font
   * size and container — no hard-coded pixel assumption.
   *
   * Segments that would otherwise render below this width are pinned to
   * it, and the deficit is redistributed proportionally across the
   * remaining segments. The pointer is positioned against actual rendered
   * segment widths so it always lands inside the correct segment.
   *
   * If the floor is infeasible (would exceed the bar's width), the
   * smallest segments are un-pinned first (graceful degradation).
   *
   * Pass `0` (or `"0"`) to disable the floor entirely.
   */
  minSegmentWidth?: number | string
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

// Default floor for segment widths. Picked so a tooltip-trigger segment is
// reliably hoverable/tappable and visually legible at any reasonable bar
// width. Override per-instance via the `minSegmentWidth` prop (pass `0` to
// fully disable the floor). Expressed in rem so it scales with the host
// app's root font size.
const DEFAULT_MIN_SEGMENT_WIDTH = "1.25rem"

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi)
}

/**
 * Distribute `totalPx` across N segments given each segment's natural fraction.
 * Pins any segment whose natural width falls below `minPx` and redistributes
 * the deficit proportionally across the unpinned remainder. If the floor is
 * infeasible (`minPx * N > totalPx`), un-pins the smallest segments first.
 *
 * Pure function — no React, no DOM. O(N) with at most N passes (N is segment
 * count, typically 3–7).
 */
function distributeWidths(
  fractions: number[],
  totalPx: number,
  minPx: number
): number[] {
  const N = fractions.length
  if (N === 0) return []
  if (minPx <= 0 || totalPx <= 0) return fractions.map((f) => f * totalPx)

  // If the floor itself is infeasible, drop it for the smallest segments
  // until it fits. Order by natural size ascending — biggest segments keep
  // their floor, smallest ones lose it.
  let effectiveMin = minPx
  if (minPx * N > totalPx) {
    effectiveMin = totalPx / N
  }

  const pinned = new Array<boolean>(N).fill(false)
  const widths = fractions.map((f) => f * totalPx)

  // Iterate: pin anything below the floor, then redistribute the deficit
  // across unpinned segments proportionally to their current width.
  for (let pass = 0; pass < N; pass++) {
    let deficit = 0
    let unpinnedSum = 0
    for (let i = 0; i < N; i++) {
      if (pinned[i]) continue
      if (widths[i] < effectiveMin) {
        deficit += effectiveMin - widths[i]
        widths[i] = effectiveMin
        pinned[i] = true
      } else {
        unpinnedSum += widths[i]
      }
    }
    if (deficit === 0 || unpinnedSum === 0) break
    const scale = (unpinnedSum - deficit) / unpinnedSum
    if (scale <= 0) break
    for (let i = 0; i < N; i++) {
      if (!pinned[i]) widths[i] *= scale
    }
  }

  return widths
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
  minSegmentWidth = DEFAULT_MIN_SEGMENT_WIDTH,
  renderPointer,
  renderSegment,
  className,
}: ReferenceRangeProps) {
  // Stitch ranges: derive start from previous end when omitted; throw if explicitly
  // provided but mismatched — this is an assertion, not a layout hint.
  const stitched: ReferenceRangeFirst[] = ranges.map((r, i) => {
    if (i === 0) return r as ReferenceRangeFirst
    const prevEnd = ranges[i - 1].end
    if (r.start === undefined || r.start === null) {
      return { ...r, start: prevEnd } as ReferenceRangeFirst
    }
    if (prevEnd !== null && r.start !== prevEnd) {
      throw new Error(
        `[ReferenceRange] Invalid \`ranges\` prop: ranges[${i}].start is ${r.start}, expected ${prevEnd} (ranges[${i - 1}].end). Omit \`start\` on ranges[${i}] to derive it automatically.`
      )
    }
    return r as ReferenceRangeFirst
  })

  // Resolve visual bounds using avg closed-segment width as the baseline
  // for open-ended bookends.
  const closedWidths = stitched
    .map((r) => (r.start != null && r.end != null ? r.end - r.start : null))
    .filter((w): w is number => w != null)
  const avgClosedWidth = closedWidths.length
    ? closedWidths.reduce((a, b) => a + b, 0) / closedWidths.length
    : 1

  type Resolved = ReferenceRangeFirst & {
    vStart: number
    vEnd: number
    isOpenStart: boolean
    isOpenEnd: boolean
  }

  const resolved: Resolved[] = stitched.map((r, i) => {
    const isOpenStart = r.start == null
    const isOpenEnd = r.end == null
    let vStart = r.start ?? 0
    let vEnd = r.end ?? 0
    if (isOpenStart) {
      const anchor = r.end ?? stitched[i + 1]?.start ?? 0
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
    for (let i = 0; i < stitched.length; i++) {
      const r = stitched[i]
      const isFirst = i === 0
      const isLast = i === stitched.length - 1
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

  // Bar pixel width — measured client-side by the layout effect below. Used
  // both for the mask cutout and for the `minSegmentWidth` solver. Declared
  // up here so the position helpers can read it.
  const barRef = React.useRef<HTMLDivElement>(null)
  const [barWidth, setBarWidth] = React.useState(0)

  // `minSegmentWidth` may be any CSS length (`"1.5rem"`, `"2em"`, `"5%"`,
  // `"clamp(...)"`, etc.) — resolve it to pixels by reading the rendered
  // width of a hidden sibling whose `width` is set to the raw value. This
  // lets `em`/`rem`/`%` honor the host's font size and bar width without
  // us hard-coding any unit assumption. A number is treated as px directly.
  const minMeasureRef = React.useRef<HTMLDivElement>(null)
  const [minSegmentPx, setMinSegmentPx] = React.useState(
    typeof minSegmentWidth === "number" ? minSegmentWidth : 0
  )
  React.useLayoutEffect(() => {
    if (typeof minSegmentWidth === "number") {
      setMinSegmentPx(minSegmentWidth)
      return
    }
    const el = minMeasureRef.current
    if (!el) return
    const update = () =>
      setMinSegmentPx(el.getBoundingClientRect().width)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [minSegmentWidth])

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

  // Pinned segment widths in pixels — only populated when the consumer set
  // `minSegmentWidth` AND we've measured the bar at least once. While null,
  // positioning falls back to the legacy pure-percentage `calc()` path so
  // existing consumers see identical behavior bit-for-bit.
  const pinnedWidths: number[] | null =
    minSegmentPx > 0 && barWidth > 0
      ? distributeWidths(
        Array.from({ length: N }, (_, i) => segmentFraction(i)),
        Math.max(barWidth - (N - 1) * GAP_PX, 0),
        minSegmentPx
      )
      : null

  // Boundary values (local === 0 with idx > 0, or local === 1 with idx < N-1)
  // sit in the visual gap between adjacent segments. Center them in the gap
  // so a tick or pointer at the boundary aligns with the gap, not the edge
  // of the next bar.
  const boundaryGapAdjust = (idx: number, local: number) => {
    let gapOffset = idx * GAP_PX
    if (local === 0 && idx > 0) gapOffset -= GAP_PX / 2
    else if (local === 1 && idx < N - 1) gapOffset += GAP_PX / 2
    return gapOffset
  }

  // Pointer-only inset (px per side). Shrinks each segment's usable area
  // before mapping the value, so a value at the segment's start/end never
  // sits flush against the segment edge — and movement stays monotonic
  // (value+1 always shifts the pointer forward, never backward). Applied to
  // ALL segments, including the bar's outer extremes. Ticks are not inset.
  // Clamped per-segment to W/3 so very narrow pinned segments still have a
  // positive usable area.
  const POINTER_EDGE_INSET_PX = 4
  const insetLocalForWidth = (local: number, widthPx: number) => {
    if (widthPx <= 0) return local
    const inset = Math.min(POINTER_EDGE_INSET_PX, widthPx / 3)
    return (inset + local * (widthPx - 2 * inset)) / widthPx
  }

  // Pixel offset of a value from the bar's left edge. Used for both the
  // pointer wrapper position and the mask cutout. Only valid when
  // `pinnedWidths` is set (we know each segment's actual rendered width).
  const valueToPx = (v: number, inset = false) => {
    if (!pinnedWidths) return null
    const { idx, local: rawLocal } = valueToCumulativeFraction(v)
    const segW = pinnedWidths[idx]
    const local = inset ? insetLocalForWidth(rawLocal, segW) : rawLocal
    let px = 0
    for (let j = 0; j < idx; j++) px += pinnedWidths[j]
    px += local * segW
    px += boundaryGapAdjust(idx, local)
    return px
  }

  const valueToCalcLeft = (v: number, offsetPx = 0, inset = false) => {
    const pinnedPx = valueToPx(v, inset)
    if (pinnedPx != null) return `${pinnedPx + offsetPx}px`
    const { frac: rawFrac, idx, local: rawLocal } = valueToCumulativeFraction(v)
    // Fallback (no minSegmentWidth set / pre-measure): segment's effective
    // rendered width is its share of the bar minus its share of total gap.
    const segW =
      barWidth > 0
        ? segmentFraction(idx) * (barWidth - (N - 1) * GAP_PX)
        : 0
    const local = inset ? insetLocalForWidth(rawLocal, segW) : rawLocal
    let frac = rawFrac
    if (local !== rawLocal) {
      frac = 0
      for (let j = 0; j < idx; j++) frac += segmentFraction(j)
      frac += local * segmentFraction(idx)
    }
    const gapOffset = boundaryGapAdjust(idx, local)
    const pxPart = -frac * (N - 1) * GAP_PX + gapOffset + offsetPx
    const sign = pxPart >= 0 ? "+" : "-"
    return `calc(${frac * 100}% ${sign} ${Math.abs(pxPart)}px)`
  }

  const pointerIndex = clamp(findRangeIndex(value), 0, stitched.length - 1)
  const pointerRange = stitched[pointerIndex]
  const pointerColor = pointerRange.color
  const pointerLeft = valueToCalcLeft(value, 0, true)
  const pointerPercent = valueToCumulativeFraction(value).frac * 100

  let ticks: number[] = []
  if (tickLabels === "boundaries") {
    const set = new Set<number>()
    for (const r of stitched) {
      if (r.start != null) set.add(r.start)
      if (r.end != null) set.add(r.end)
    }
    const first = stitched[0]
    const last = stitched[stitched.length - 1]
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
  const cutoutLeftPx = (() => {
    const pinnedPx = valueToPx(value, true)
    if (pinnedPx != null) return pinnedPx - POINTER_W / 2
    const segW =
      barWidth > 0
        ? segmentFraction(cutoutFracInfo.idx) * (barWidth - (N - 1) * GAP_PX)
        : 0
    const local = insetLocalForWidth(cutoutFracInfo.local, segW)
    let frac = cutoutFracInfo.frac
    if (local !== cutoutFracInfo.local) {
      frac = 0
      for (let j = 0; j < cutoutFracInfo.idx; j++) frac += segmentFraction(j)
      frac += local * segmentFraction(cutoutFracInfo.idx)
    }
    const gapOffset = boundaryGapAdjust(cutoutFracInfo.idx, local)
    return (
      barWidth * frac -
      frac * (N - 1) * GAP_PX +
      gapOffset -
      POINTER_W / 2
    )
  })()

  const clampedValueLeft = `clamp(var(--ref-halfw), ${pointerLeft}, calc(100% - var(--ref-halfw)))`

  return (
    <div className={cn(referenceRangeVariants(), className)}>
      {typeof minSegmentWidth !== "number" && (
        <div
          ref={minMeasureRef}
          aria-hidden
          style={{
            width: minSegmentWidth,
            height: 0,
            position: "absolute",
            visibility: "hidden",
            pointerEvents: "none",
          }}
        />
      )}
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
            // When `minSegmentWidth` is active, pin each segment to its
            // solver-computed pixel width and disable flex grow/shrink so
            // pointer math (which assumes those exact widths) stays valid.
            const segmentStyle: React.CSSProperties = pinnedWidths
              ? {
                width: `${pinnedWidths[i]}px`,
                flex: "0 0 auto",
                backgroundColor: r.color,
              }
              : {
                flex: flexBasis,
                backgroundColor: r.color,
              }
            if (renderSegment) {
              return (
                <React.Fragment key={i}>
                  {renderSegment({
                    range: stitched[i],
                    index: i,
                    widthPercent,
                    isOpenStart: r.isOpenStart,
                    isOpenEnd: r.isOpenEnd,
                  })}
                </React.Fragment>
              )
            }
            const segment = (
              <div className="h-2.5 rounded-full" style={segmentStyle} />
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
