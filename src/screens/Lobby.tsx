import { useEffect, useState } from 'react'
import { DIFFICULTIES, type Difficulty } from '../../shared/difficulty'
import { loadRecorder } from '../analytics'
import type { MpPhase, PlayerInfo } from '../net/useMultiplayer'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'

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

  useEffect(loadRecorder, [])

  if (phase === 'lobby') {
    return (
      <div className="flex w-full max-w-md flex-col gap-6">
        <Label>Share this code</Label>
        <div className="border-2 border-black py-6 text-center text-6xl font-black tracking-[0.3em]">{code}</div>
        <p className="font-bold text-neutral-600">{DIFFICULTIES[difficulty].label} · waiting for an opponent…</p>
        <div className="flex gap-2">
          {players.map((p) => (
            <span key={p.id} className="bg-[#1f9d55] px-3 py-1.5 text-sm font-bold text-white">
              {p.name}
            </span>
          ))}
          {players.length < 2 && (
            <span className="border-2 border-dashed border-neutral-300 px-3 py-1.5 text-sm font-bold text-neutral-400">
              empty seat
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="self-start px-0" onClick={onBack}>
          ← Cancel
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <h2 className="text-3xl font-black">Play 1v1</h2>

      <Button variant="info" size="lg" block onClick={() => onCreate(defaultDifficulty)}>
        Create game · {DIFFICULTIES[defaultDifficulty].label}
      </Button>

      <Label className="text-center">or join</Label>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (joinCode.trim().length >= 4) onJoin(joinCode.trim())
        }}
        className="flex flex-col gap-3"
      >
        <Input
          size="lg"
          center
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
          placeholder="CODE"
        />
        <Button type="submit" variant="dark" size="lg" block disabled={joinCode.trim().length < 4}>
          Join game
        </Button>
        {error && <p className="font-bold text-[#e23b3b]">{error}</p>}
      </form>

      <Button variant="ghost" size="sm" className="self-start px-0" onClick={onBack}>
        ← Back
      </Button>
    </div>
  )
}
