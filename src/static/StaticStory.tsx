import { StopContent } from '../overlay/StopContent'
import { PROFILE, STOPS } from '../story/stops'

const STILL_ALT: Record<string, string> = {
  college: 'A glowing red path on a dark board reaching the first block, B.Tech CSE.',
  intern: 'Two blocks on the board, labelled i18n and AST codemod.',
  sde1: 'Three blocks on the board: Chrome extension, chart wrapper and UI migration.',
  hackathons: 'Three blocks on the board: Career Site Builder, AI Recruiter and Aegis.',
  projects:
    'React-Learn on a floating monitor beside its component tree, and FocusGuard: a browser inside a red shield with site tiles bouncing off it.',
  kickboxer: 'A collectible kickboxer figure on a lit stand with a KICKBOXER nameplate.',
}

/**
 * The reduced-motion version: no 3D and no scroll animation, just the story as a normal page,
 * with a still of each stop rendered from the 3D scene.
 */
export default function StaticStory() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
      <header className="max-w-xl">
        <p className="font-mono text-xs tracking-[0.2em] text-neon uppercase">[ {PROFILE.role} ]</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-7xl">{PROFILE.name}</h1>
        <p className="mt-5 text-base leading-relaxed text-ash sm:text-lg">{PROFILE.intro}</p>
      </header>
      {STOPS.map((stop, i) => (
        <section
          key={stop.id}
          className="mt-20 grid items-start gap-8 border-t border-white/10 pt-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-12"
        >
          <div>
            <StopContent index={i} />
          </div>
          <img
            src={`/stills/${stop.id}.jpg`}
            alt={STILL_ALT[stop.id] ?? ''}
            width={1476}
            height={1350}
            loading="lazy"
            className="w-full rounded-2xl border border-white/10"
          />
        </section>
      ))}
    </main>
  )
}
