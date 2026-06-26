import { useState } from 'react'
import { DIFFICULTIES, type Difficulty } from '../../shared/difficulty'
import type { MpPhase, PlayerInfo } from '../net/useMultiplayer'

interface Props {
  phase: MpPhase
  code: string
  players: PlayerInfo[]
  difficulty: Difficulty
  defaultDifficulty: Difficulty
  error: string
  onCreate: (d: Difficulty) => void
  onJoin: (code: string) => void
  onBack: () => void
}

export function Lobby({ phase, code, players, difficulty, defaultDifficulty, error, onCreate, onJoin, onBack }: Props) {
  const [joinCode, setJoinCode] = useState('')

  if (phase === 'lobby') {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <p className="text-sm font-bold uppercase tracking-wider text-white/50">Share this code</p>
        <div className="rounded-3xl bg-white/10 px-10 py-6">
          <div className="text-6xl font-black tracking-[0.3em] text-amber-300">{code}</div>
        </div>
        <p className="text-sm font-semibold text-white/60">
          {DIFFICULTIES[difficulty].label} · waiting for an opponent to join…
        </p>
        <div className="flex gap-2">
          {players.map((p) => (
            <span key={p.id} className="rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-bold text-white">
              {p.name}
            </span>
          ))}
          {players.length < 2 && (
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white/40">
              empty seat…
            </span>
          )}
        </div>
        <button type="button" onClick={onBack} className="text-sm font-bold text-white/50 hover:text-white">
          ← Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <h2 className="text-center text-3xl font-black text-white">Multiplayer</h2>

      <button
        type="button"
        onClick={() => onCreate(defaultDifficulty)}
        className="rounded-2xl bg-fuchsia-500 py-4 text-lg font-black text-white shadow-lg shadow-fuchsia-500/30 transition hover:bg-fuchsia-400 active:scale-[0.98]"
      >
        ＋ Create game ({DIFFICULTIES[defaultDifficulty].label})
      </button>

      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-white/30">
        <div className="h-px flex-1 bg-white/10" /> or join <div className="h-px flex-1 bg-white/10" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (joinCode.trim().length >= 4) onJoin(joinCode.trim())
        }}
        className="space-y-3"
      >
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
          placeholder="CODE"
          className="w-full rounded-2xl bg-white/10 py-4 text-center text-3xl font-black tracking-[0.3em] text-white placeholder:text-white/20 outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <button
          type="submit"
          disabled={joinCode.trim().length < 4}
          className="w-full rounded-2xl bg-emerald-500 py-4 text-lg font-black text-white shadow-lg shadow-emerald-500/30 transition enabled:hover:bg-emerald-400 disabled:opacity-40"
        >
          Join game
        </button>
        {error && <p className="text-center text-sm font-bold text-rose-400">{error}</p>}
      </form>

      <button type="button" onClick={onBack} className="text-sm font-bold text-white/50 hover:text-white">
        ← Back
      </button>
    </div>
  )
}
