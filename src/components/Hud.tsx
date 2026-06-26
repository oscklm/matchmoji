import { useEffect, useState } from 'react'
import type { PlayerInfo } from '../net/useMultiplayer'

interface Props {
  endTime: number
  totalSeconds: number
  players: PlayerInfo[]
  scores: Record<string, number>
  combos: Record<string, number>
  me: string
}

function useNow(active: boolean) {
  const [, force] = useState(0)
  useEffect(() => {
    if (!active) return
    const iv = setInterval(() => force((n) => n + 1), 100)
    return () => clearInterval(iv)
  }, [active])
}

export function Hud({ endTime, totalSeconds, players, scores, combos, me }: Props) {
  useNow(endTime > 0)
  const remainingMs = Math.max(0, endTime - Date.now())
  const remaining = Math.ceil(remainingMs / 1000)
  const pct = Math.max(0, Math.min(100, (remainingMs / (totalSeconds * 1000)) * 100))
  const low = remaining <= 10
  const myCombo = combos[me] ?? 0

  return (
    <div className="w-full max-w-xl space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {players.map((p) => {
            const isMe = p.id === me
            return (
              <div
                key={p.id}
                className={`rounded-xl px-3 py-1.5 text-sm font-bold shadow ${
                  isMe ? 'bg-emerald-500 text-white' : 'bg-fuchsia-500 text-white'
                }`}
              >
                <span className="opacity-80">{isMe ? 'You' : p.name}</span>{' '}
                <span className="tabular-nums">{scores[p.id] ?? 0}</span>
              </div>
            )
          })}
        </div>
        <div
          className={`tabular-nums text-3xl font-black ${low ? 'text-rose-400' : 'text-white'} ${
            low ? 'animate-pulse' : ''
          }`}
        >
          {remaining}
          <span className="text-base font-bold opacity-60">s</span>
        </div>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-[width] duration-100 ease-linear ${
            low ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="h-6 text-center">
        {myCombo >= 2 && (
          <span className="animate-pop inline-block rounded-full bg-amber-400 px-3 py-0.5 text-sm font-black text-amber-950">
            🔥 Combo x{myCombo}
          </span>
        )}
      </div>
    </div>
  )
}
