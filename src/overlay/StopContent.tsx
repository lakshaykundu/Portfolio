import { setHoveredNode } from '../story/hover'
import { STOPS, type StoryLink, type StoryNode } from '../story/stops'

// Shared by the 3D version's card and the reduced-motion page. No 3D imports here.

const pad = (n: number) => String(n).padStart(2, '0')

function NodeItem({ node, highlighted }: { node: StoryNode; highlighted: boolean }) {
  return (
    <li
      onPointerEnter={() => setHoveredNode(node.id)}
      onPointerLeave={() => setHoveredNode(null)}
      className={`rounded-xl border px-4 py-3.5 transition-colors ${
        highlighted ? 'border-neon/50 bg-white/[0.04]' : 'border-white/10'
      }`}
    >
      {node.impact && (
        <p className="font-mono text-[11px] tracking-[0.15em] text-neon uppercase">{node.impact}</p>
      )}
      <h3 className={`font-medium ${node.impact ? 'mt-1' : ''}`}>{node.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-ash">{node.description}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {node.tags?.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] tracking-wide text-ash"
          >
            {tag}
          </span>
        ))}
        {node.links?.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-neon/40 px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-white hover:border-neon hover:bg-neon/10"
          >
            {link.label} ↗
          </a>
        ))}
      </div>
    </li>
  )
}

function StopLinks({ links }: { links: StoryLink[] }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-2">
      {links.map((link) => {
        const external = link.href.startsWith('http')
        return (
          <a
            key={link.href}
            href={link.href}
            download={link.download}
            target={external ? '_blank' : undefined}
            rel={external ? 'noreferrer' : undefined}
            className="rounded-xl border border-white/10 px-4 py-3 font-mono text-xs tracking-[0.15em] text-white uppercase transition-colors hover:border-neon/60 hover:bg-neon/10"
          >
            {link.label} {link.download ? '↓' : '↗'}
          </a>
        )
      })}
    </div>
  )
}

/** A stop's text: number, dates, title, summary, links and one item per project. */
export function StopContent({ index, hovered }: { index: number; hovered?: string | null }) {
  const stop = STOPS[index]
  return (
    <>
      <p className="font-mono text-xs tracking-[0.2em]">
        <span className="text-neon">{pad(index + 1)}</span>
        <span className="text-ash"> / {pad(STOPS.length)}</span>
        <span className="ml-3 text-ash uppercase">{stop.period}</span>
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{stop.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ash md:text-base">{stop.summary}</p>
      {stop.links && <StopLinks links={stop.links} />}
      {stop.nodes.length > 0 && (
        <ul className="mt-5 space-y-2.5">
          {stop.nodes.map((node) => (
            <NodeItem key={node.id} node={node} highlighted={hovered === node.id} />
          ))}
        </ul>
      )}
    </>
  )
}
