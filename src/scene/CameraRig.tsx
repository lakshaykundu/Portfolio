import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Fog } from 'three'
import { getScrollProgress } from '../scroll/smoothScroll'
import { CAMERA_DIRECTION } from '../story/layout'
import { sampleStory } from '../story/timeline'

/**
 * Right edge of the story card in px, matching its classes in StoryCard (left margin + width).
 * The picture is shifted so the stop sits centred in the space beside the card.
 */
function cardRightEdge(width: number) {
  if (width >= 1024) return 56 + 400
  if (width >= 768) return 40 + 340
  return 0
}

/** On phones the card is a sheet over roughly the bottom half, so the picture moves up instead. */
const PHONE_SHIFT_UP = 0.22

/**
 * Width-to-height ratio of the free space beside the card on the 1440×900 desktop the stop
 * distances were tuned on. Narrower free space (small laptops, phones) pulls the camera back so
 * every stop still fits across.
 */
const TUNED_FREE_ASPECT = (1440 - cardRightEdge(1440)) / 900

// Fog starts just behind whatever the camera is looking at, so it fades the far board without
// swallowing the stop, however far the camera has pulled back.
const FOG_START = 10
const FOG_DEPTH = 100

export function CameraRig() {
  const applied = useRef({ size: '', fit: 1 })

  useFrame(({ camera, size, scene }) => {
    const sizeKey = `${size.width}x${size.height}`
    if (sizeKey !== applied.current.size) {
      const cardEdge = cardRightEdge(size.width)
      const shiftUp = cardEdge ? 0 : size.height * PHONE_SHIFT_UP
      camera.setViewOffset(size.width, size.height, -cardEdge / 2, shiftUp, size.width, size.height)
      const freeAspect = (size.width - cardEdge) / size.height
      applied.current = { size: sizeKey, fit: Math.max(1, TUNED_FREE_ASPECT / freeAspect) }
    }

    const { focus, distance } = sampleStory(getScrollProgress())
    const fitted = distance * applied.current.fit
    camera.position.copy(focus).addScaledVector(CAMERA_DIRECTION, fitted)
    camera.lookAt(focus)

    const fog = scene.fog as Fog | null
    if (fog) {
      fog.near = fitted + FOG_START
      fog.far = fitted + FOG_START + FOG_DEPTH
    }
  })
  return null
}
