import { useEffect, useState } from 'react'
import type { PlayerInfo } from '../net/useMultiplayer'
import type { Highscore } from '../highscores'

interface Props {
  endTime: number
  totalSeconds: number
  players: PlayerInfo[]
  scores: Record<string, number>
  combos: Record<string, number>
  movesLeft: Record<string, number | null>
  me: string
  highscore?: Highscore
}

function useTick(active: boolean) {
  const [, force] = useState(0)
  useEffect(() => {
    if (!active) return
    const iv = setInterval(() => force((n) => n + 1), 100)
    return () => clearInterval(iv)
  }, [active])
}

function Cap({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-xs font-black uppercase tracking-widest text-neutral-400 ${className}`}>{children}</div>
}

export function Hud({ endTime, totalSeconds, players, scores, combos, movesLeft, me, highscore }: Props) {
  useTick(endTime > 0)
  const remainingMs = Math.max(0, endTime - Date.now())
  const remaining = Math.ceil(remainingMs / 1000)
  const pct = Math.max(0, Math.min(100, (remainingMs / (totalSeconds * 1000)) * 100))
  const low = remaining <= 10
  const myCombo = combos[me] ?? 0
  const myMoves = movesLeft[me]
  const lowMoves = myMoves !== null && myMoves !== undefined && myMoves <= 3
  const solo = players.length <= 1
  const opp = players.find((p) => p.id !== me)

  const time = (
    <div className="text-center">
      <Cap>Time</Cap>
      <div className={`text-5xl font-black tabular-nums ${low ? 'text-[#e23b3b]' : 'text-black'}`}>{remaining}</div>
      {myMoves !== null && myMoves !== undefined && (
        <div className={`text-sm font-black ${lowMoves ? 'text-[#e23b3b]' : 'text-neutral-500'}`}>
          {myMoves} moves left
        </div>
      )}
      {solo && highscore && highscore.time > 0 && (
        <div className="text-sm font-black text-neutral-500">Best {highscore.time}s</div>
      )}
    </div>
  )

  return (
    <div className="w-full max-w-xl">
      {solo ? (
        <div className="flex items-start justify-between">
          <div>
            <Cap>Score</Cap>
            <div className="text-6xl font-black leading-none tabular-nums">{scores[me] ?? 0}</div>
            {highscore && highscore.score > 0 && (
              <div className="text-sm font-black text-neutral-500">Best {highscore.score}</div>
            )}
          </div>
          {time}
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div>
            <Cap className="text-[#1f9d55]">You</Cap>
            <div className="text-5xl font-black leading-none tabular-nums text-[#1f9d55]">{scores[me] ?? 0}</div>
          </div>
          {time}
          <div className="text-right">
            <Cap className="text-[#2b6ce4]">{opp?.name ?? 'Rival'}</Cap>
            <div className="text-5xl font-black leading-none tabular-nums text-[#2b6ce4]">
              {opp ? scores[opp.id] ?? 0 : 0}
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 h-2.5 w-full bg-neutral-200">
        <div
          className={`h-full ${low ? 'bg-[#e23b3b]' : 'bg-[#1f9d55]'}`}
          style={{ width: `${pct}%`, transition: 'width 100ms linear' }}
        />
      </div>

      <div className="mt-2 h-7 text-center">
        {myCombo >= 2 && (
          <span className="animate-pop inline-block bg-black px-3 py-1 text-sm font-black text-white">
            COMBO ×{myCombo}
          </span>
        )}
      </div>
    </div>
  )
}
