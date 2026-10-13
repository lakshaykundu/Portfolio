import type { IconNode } from 'lucide'
import type { BufferGeometry } from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

// Lucide icons are drawn on a 24×24 grid with 2px round strokes.
const GRID = 24
const STROKE = SVGLoader.getStrokeStyle(2, '#fff', 'round', 'round')
const loader = new SVGLoader()
const cache = new Map<IconNode, BufferGeometry>()

function toSvg(icon: IconNode) {
  const elements = icon.map(([tag, attrs]) => {
    const attributes = Object.entries(attrs)
      .map(([name, value]) => `${name}="${value}"`)
      .join(' ')
    return `<${tag} ${attributes}/>`
  })
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GRID} ${GRID}">${elements.join('')}</svg>`
}

/**
 * A Lucide icon's strokes as flat geometry: 1 unit across, centred on the origin, in the XY
 * plane. The Y flip mirrors the triangles, so render it with `side={DoubleSide}`.
 */
export function iconGeometry(icon: IconNode) {
  let geometry = cache.get(icon)
  if (!geometry) {
    const strokes = loader.parse(toSvg(icon)).paths.flatMap((path) =>
      path.subPaths.map((subPath) => SVGLoader.pointsToStroke(subPath.getPoints(), STROKE)),
    )
    geometry = mergeGeometries(strokes.filter(Boolean))
    geometry.translate(-GRID / 2, -GRID / 2, 0)
    // SVG's Y axis points down.
    geometry.scale(1 / GRID, -1 / GRID, 1)
    cache.set(icon, geometry)
  }
  return geometry
}
