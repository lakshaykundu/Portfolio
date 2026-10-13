import { Analytics } from '@vercel/analytics/react'
import { lazy, Suspense } from 'react'
import { IntroContent } from './overlay/IntroContent'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

// Both versions load on demand. The 3D one carries three.js, most of the download, so people who
// asked for reduced motion never fetch it, and everyone sees the name while it loads.
const MotionStory = lazy(() => import('./MotionStory'))
const StaticStory = lazy(() => import('./static/StaticStory'))

export default function App() {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <>
      <Suspense fallback={<IntroContent visible />}>
        {reducedMotion ? <StaticStory /> : <MotionStory />}
      </Suspense>
      <Analytics />
    </>
  )
}
