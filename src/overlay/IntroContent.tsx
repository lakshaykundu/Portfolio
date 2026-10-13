import { PROFILE } from '../story/stops'

/**
 * The opening screen's text. Kept free of 3D imports so it can also show on its own while the
 * 3D scene is still downloading.
 */
export function IntroContent({ visible, onSkip }: { visible: boolean; onSkip?: () => void }) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 flex flex-col justify-between bg-linear-to-r from-ink/90 via-ink/40 to-transparent px-6 py-10 transition-opacity duration-700 sm:px-14 sm:py-14 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div />
      <div className="max-w-xl">
        <p className="font-mono text-xs tracking-[0.2em] text-neon uppercase">[ {PROFILE.role} ]</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-7xl">{PROFILE.name}</h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ash sm:text-lg">{PROFILE.intro}</p>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className={`mt-8 font-mono text-xs tracking-[0.2em] text-white/70 underline-offset-4 hover:text-white hover:underline ${
              visible ? 'pointer-events-auto' : ''
            }`}
          >
            SKIP TO PROJECTS →
          </button>
        )}
      </div>
      <p className="self-center font-mono text-xs tracking-[0.2em] text-ash">
        [ SCROLL TO FOLLOW MY STORY ]
      </p>
    </div>
  )
}
