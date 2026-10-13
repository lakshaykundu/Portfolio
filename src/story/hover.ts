import { useSyncExternalStore } from 'react'

// The project the pointer is over on the card. The matching 3D node reads it every frame and
// lights up; the card re-renders to highlight the item.
let hovered: string | null = null
const listeners = new Set<() => void>()

export function getHoveredNode() {
  return hovered
}

export function setHoveredNode(id: string | null) {
  if (id === hovered) return
  hovered = id
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useHoveredNode() {
  return useSyncExternalStore(subscribe, getHoveredNode)
}
