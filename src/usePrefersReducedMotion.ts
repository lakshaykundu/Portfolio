import { useSyncExternalStore } from 'react'

const query = window.matchMedia('(prefers-reduced-motion: reduce)')

function subscribe(listener: () => void) {
  query.addEventListener('change', listener)
  return () => query.removeEventListener('change', listener)
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, () => query.matches)
}
