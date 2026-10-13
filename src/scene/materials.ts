/**
 * For faces with glowing edge lines drawn on top. The lines sit at exactly the same depth as the
 * faces, so without this they z-fight and flicker whenever the object or camera moves. Pushing
 * the faces back a hair in the depth buffer lets the lines always win.
 */
export const BEHIND_EDGES = {
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
} as const

/**
 * Transparent things are re-sorted by distance every frame. Around the FocusGuard shield that
 * order kept flipping as tiles moved, so the shield popped in and out behind them. A fixed order
 * keeps it stable: tiles first, then the additive shield over them.
 */
export const RENDER_ORDER = { tiles: 1, shield: 2 } as const
