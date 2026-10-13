import { scrollToStop, useCurrentStop } from '../scroll/smoothScroll'
import { STOPS } from '../story/stops'
import { INTRO } from '../story/timeline'
import { IntroContent } from './IntroContent'

const PROJECTS_STOP = STOPS.findIndex((stop) => stop.id === 'projects')

export function Intro() {
  return (
    <IntroContent
      visible={useCurrentStop() === INTRO}
      onSkip={() => scrollToStop(PROJECTS_STOP)}
    />
  )
}
