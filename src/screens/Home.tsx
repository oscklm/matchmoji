import { useState } from 'react'
import { DIFFICULTIES, DIFFICULTY_ORDER, type Difficulty } from '../../shared/difficulty'
import { getShowCountdown, saveShowCountdown } from '../identity'
import { NameChip } from '../components/NameChip'
import { RainbowText } from '../components/RainbowText'
import { Button } from '../ui/Button'
import { Label } from '../ui/Label'
import { Toggle } from '../ui/Toggle'

interface Props {
  name: string
  onName: (name: string) => void
  onSolo: (d: Difficulty, showCountdown: boolean) => void
  onMultiplayer: (d: Difficulty) => void
}

export function Home({ name, onName, onSolo, onMultiplayer }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [showCountdown, setShowCountdown] = useState(getShowCountdown)

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="" draggable={false} className="h-12 w-12 sm:h-14 sm:w-14" />
        <h1 className="text-5xl font-black tracking-tight sm:text-6xl">Matchmoji</h1>
      </div>

      <div className="flex justify-center">
        <div>
          <Label>Your name</Label>
          <NameChip name={name} onChange={onName} />
        </div>
      </div>

      <div>
        <Label>Difficulty</Label>
        <div className="grid grid-cols-2 gap-2">
          {DIFFICULTY_ORDER.map((key) => {
            const d = DIFFICULTIES[key]
            const active = key === difficulty
            return (
              <button
                key={key}
                type="button"
                onClick={() => setDifficulty(key)}
                className={`py-4 text-center text-lg font-black ${
                  active ? 'bg-black text-white' : 'border-2 border-black bg-white text-black'
                }`}
              >
                {d.rainbow ? <RainbowText text={d.label} /> : d.label}
              </button>
            )
          })}
        </div>
      </div>

      <Toggle
        label="Show countdown"
        description="Start solo games with a 3-2-1 countdown."
        checked={showCountdown}
        onChange={(v) => setShowCountdown(saveShowCountdown(v))}
      />

      <div className="grid gap-2">
        <Button variant="primary" size="lg" block onClick={() => onSolo(difficulty, showCountdown)}>
          Play solo
        </Button>
        <Button variant="info" size="lg" block onClick={() => onMultiplayer(difficulty)}>
          Play 1v1
        </Button>
      </div>
    </div>
  )
}
