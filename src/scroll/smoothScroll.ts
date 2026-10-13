import { addEffect } from '@react-three/fiber'
import Lenis from 'lenis'
import { useEffect, useSyncExternalStore } from 'react'
import { INTRO, progressForStop, sampleStory } from '../story/timeline'

// Scroll progress lives outside React: the 3D scene reads it every frame, and the DOM overlay only
// re-renders when the current stop changes.
let progress = 0
let currentStop = INTRO
let lenis: Lenis | null = null
const listeners = new Set<() => void>()
const progressListeners = new Set<(progress: number) => void>()

export function getScrollProgress() {
  return progress
}

/** For DOM that tracks scroll continuously without re-rendering, like the progress bar fill. */
export function onProgress(listener: (progress: number) => void) {
  progressListeners.add(listener)
  listener(progress)
  return () => {
    progressListeners.delete(listener)
  }
}

function setProgress(next: number) {
  progress = Math.min(Math.max(next, 0), 1)
  progressListeners.forEach((listener) => listener(progress))
  const stop = sampleStory(progress).stop
  if (stop !== currentStop) {
    currentStop = stop
    listeners.forEach((listener) => listener())
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useCurrentStop() {
  return useSyncExternalStore(subscribe, () => currentStop)
}

export function scrollToStop(stop: number) {
  if (!lenis) return
  lenis.scrollTo(progressForStop(stop) * lenis.limit, { duration: 2.4 })
}

export function useSmoothScroll() {
  useEffect(() => {
    const instance = new Lenis({ autoRaf: false, lerp: 0.07, wheelMultiplier: 0.8 })
    lenis = instance
    const onScroll = () => setProgress(instance.progress)
    instance.on('scroll', onScroll)
    onScroll()
    // Step the scroll inside the 3D render loop, just before the scene reads it. With two
    // separate animation loops the camera could lag or jitter a frame against the page.
    const removeEffect = addEffect((time) => instance.raf(time))
    return () => {
      removeEffect()
      instance.destroy()
      if (lenis === instance) lenis = null
    }
  }, [])
}
