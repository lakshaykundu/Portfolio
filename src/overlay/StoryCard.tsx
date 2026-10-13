import { useCurrentStop } from '../scroll/smoothScroll'
import { useHoveredNode } from '../story/hover'
import { INTRO } from '../story/timeline'
import { StopContent } from './StopContent'

/**
 * The numbered card for the current stop. On desktop it sits on the left (the camera shifts the
 * picture right to make room, see CameraRig); on phones it's a sheet at the bottom.
 */
export function StoryCard() {
  const current = useCurrentStop()
  const hovered = useHoveredNode()
  if (current === INTRO) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 flex p-3 md:inset-y-0 md:right-auto md:items-center md:p-0 md:pl-10 lg:pl-14">
      <article
        key={current}
        className="pointer-events-auto max-h-[48svh] w-full animate-card-in overflow-y-auto rounded-2xl border border-white/10 bg-ink/90 p-5 md:max-h-[calc(100svh-4rem)] md:w-[340px] md:p-6 lg:w-[400px]"
      >
        <StopContent index={current} hovered={hovered} />
      </article>
    </div>
  )
}
