import { useEffect, useRef } from 'react'
import { onProgress, scrollToStop, useCurrentStop } from '../scroll/smoothScroll'
import { STOPS } from '../story/stops'
import { progressForStop } from '../story/timeline'

// Stops are evenly spaced in scroll, so evenly spaced dots line up with the fill.
const FIRST = progressForStop(0)
const LAST = progressForStop(STOPS.length - 1)

function fillAmount(progress: number) {
  return Math.min(Math.max((progress - FIRST) / (LAST - FIRST), 0), 1)
}

type Axis = 'vertical' | 'horizontal'

/** The fill line grows with scroll, written straight to the DOM so scrolling never re-renders. */
function useFill(axis: Axis) {
  const fill = useRef<HTMLDivElement>(null)
  useEffect(
    () =>
      onProgress((progress) => {
        const scale = axis === 'vertical' ? 'scaleY' : 'scaleX'
        if (fill.current) fill.current.style.transform = `${scale}(${fillAmount(progress)})`
      }),
    [axis],
  )
  return fill
}

function StopDot({ index, current, axis }: { index: number; current: number; axis: Axis }) {
  const stop = STOPS[index]
  const isCurrent = index === current
  const at = `${(index / (STOPS.length - 1)) * 100}%`
  return (
    <button
      type="button"
      onClick={() => scrollToStop(index)}
      aria-label={`Go to ${stop.title}`}
      aria-current={isCurrent ? 'step' : undefined}
      className={`group absolute flex -translate-1/2 items-center p-2 ${
        axis === 'vertical' ? 'left-1/2' : 'top-1/2'
      }`}
      style={axis === 'vertical' ? { top: at } : { left: at }}
    >
      <span
        className={`block size-2.5 rounded-full border transition-all duration-300 ${
          index <= current ? 'border-neon bg-neon' : 'border-white/40 bg-ink'
        } ${isCurrent ? 'scale-125 shadow-[0_0_12px_#ff2d2d]' : 'group-hover:border-white'}`}
      />
      {axis === 'vertical' && (
        <span
          className={`absolute right-8 font-mono text-[11px] tracking-[0.15em] whitespace-nowrap uppercase transition-opacity ${
            isCurrent ? 'text-white opacity-100' : 'text-ash opacity-0 group-hover:opacity-100'
          }`}
        >
          {stop.title}
        </span>
      )}
    </button>
  )
}

export function ProgressRail() {
  const current = useCurrentStop()
  const verticalFill = useFill('vertical')
  const horizontalFill = useFill('horizontal')

  return (
    <>
      {/* Desktop: a rail down the right edge, labelled with the current stop. */}
      <nav
        aria-label="Story stops"
        className="fixed top-1/2 right-6 hidden h-[min(50svh,360px)] w-8 -translate-y-1/2 md:block"
      >
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/10" />
        <div
          ref={verticalFill}
          className="absolute inset-y-0 left-1/2 w-px origin-top -translate-x-1/2 bg-neon"
          style={{ transform: 'scaleY(0)' }}
        />
        {STOPS.map((stop, i) => (
          <StopDot key={stop.id} index={i} current={current} axis="vertical" />
        ))}
      </nav>
      {/* Phones: the picture fills the top and the card the bottom, so the rail becomes a thin
          bar along the top edge where it covers nothing. */}
      <nav aria-label="Story stops" className="fixed inset-x-6 top-1 h-8 md:hidden">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />
        <div
          ref={horizontalFill}
          className="absolute inset-x-0 top-1/2 h-px origin-left -translate-y-1/2 bg-neon"
          style={{ transform: 'scaleX(0)' }}
        />
        {STOPS.map((stop, i) => (
          <StopDot key={stop.id} index={i} current={current} axis="horizontal" />
        ))}
      </nav>
    </>
  )
}
