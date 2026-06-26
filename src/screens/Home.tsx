import { useState } from 'react'
import { DIFFICULTIES, DIFFICULTY_ORDER, type Difficulty } from '../../shared/difficulty'
import { NameChip } from '../components/NameChip'

interface Props {
  name: string
  onName: (name: string) => void
  onSingleplayer: (d: Difficulty) => void
  onMultiplayer: (d: Difficulty) => void
}

export function Home({ name, onName, onSingleplayer, onMultiplayer }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-black tracking-tight text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.3)] sm:text-6xl">
          Match<span className="text-amber-300">moji</span>
        </h1>
        <p className="mt-2 text-sm font-semibold text-white/60">
          Flip fast. Match smileys. Outscore your rival.
        </p>
      </div>

      <NameChip name={name} onChange={onName} />

      <div className="w-full space-y-2">
        <p className="px-1 text-xs font-bold uppercase tracking-wider text-white/50">Difficulty</p>
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTY_ORDER.map((key) => {
            const d = DIFFICULTIES[key]
            const active = key === difficulty
            return (
              <button
                key={key}
                type="button"
                onClick={() => setDifficulty(key)}
                className={`rounded-2xl px-2 py-3 text-center transition ${
                  active
                    ? 'bg-amber-300 text-amber-950 shadow-lg shadow-amber-500/30'
                    : 'bg-white/10 text-white/80 hover:bg-white/15'
                }`}
              >
                <div className="text-sm font-black">{d.label}</div>
                <div className={`text-[10px] font-semibold ${active ? 'text-amber-900/70' : 'text-white/40'}`}>
                  {d.pairs} pairs · {d.timer}s
                </div>
              </button>
            )
          })}
        </div>
        <p className="px-1 text-center text-xs font-medium text-white/40">{DIFFICULTIES[difficulty].blurb}</p>
      </div>

      <div className="grid w-full gap-3">
        <button
          type="button"
          onClick={() => onSingleplayer(difficulty)}
          className="rounded-2xl bg-emerald-500 py-4 text-lg font-black text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 active:scale-[0.98]"
        >
          ▶ Singleplayer
        </button>
        <button
          type="button"
          onClick={() => onMultiplayer(difficulty)}
          className="rounded-2xl bg-fuchsia-500 py-4 text-lg font-black text-white shadow-lg shadow-fuchsia-500/30 transition hover:bg-fuchsia-400 active:scale-[0.98]"
        >
          ⚔ Multiplayer
        </button>
      </div>
    </div>
  )
}
