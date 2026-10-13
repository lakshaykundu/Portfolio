import { Intro } from './overlay/Intro'
import { ProgressRail } from './overlay/ProgressRail'
import { StoryCard } from './overlay/StoryCard'
import { Experience } from './scene/Experience'
import { useSmoothScroll } from './scroll/smoothScroll'
import { TIMELINE_UNITS } from './story/timeline'

/** The full experience: the pinned 3D board driven by scroll, with the card and progress bar. */
export default function MotionStory() {
  useSmoothScroll()

  return (
    <>
      <div className="fixed inset-0" aria-hidden>
        <Experience />
      </div>
      <Intro />
      <StoryCard />
      <ProgressRail />
      {/* The scene is pinned; this spacer only provides the scroll distance that drives it. */}
      <div aria-hidden style={{ height: `${(TIMELINE_UNITS + 1) * 100}svh` }} />
    </>
  )
}
