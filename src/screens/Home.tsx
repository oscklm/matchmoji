import { useState } from 'react'
import { DIFFICULTIES, DIFFICULTY_ORDER, type Difficulty } from '../../shared/difficulty'
import { NameChip } from '../components/NameChip'
import { RainbowText } from '../components/RainbowText'
import { Button } from '../ui/Button'
import { Label } from '../ui/Label'
import { Toggle } from '../ui/Toggle'

interface Props {
  name: string
  onName: (name: string) => void
  onSolo: (d: Difficulty, skipCountdown: boolean) => void
  onMultiplayer: (d: Difficulty) => void
}

export function Home({ name, onName, onSolo, onMultiplayer }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [skipCountdown, setSkipCountdown] = useState(false)

  return (
    <div className="flex w-full max-w-md flex-col gap-7">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="" draggable={false} className="h-10 w-10" />
          <h1 className="text-4xl font-black tracking-tight">Matchmoji</h1>
        </div>
        <div className="w-36 shrink-0">
          <NameChip name={name} onChange={onName} />
        </div>
      </header>

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
        label="Skip countdown"
        description="Start solo games instantly, no 3-2-1."
        checked={skipCountdown}
        onChange={setSkipCountdown}
      />

      <div className="grid gap-2">
        <Button variant="primary" size="lg" block onClick={() => onSolo(difficulty, skipCountdown)}>
          Play solo
        </Button>
        <Button variant="info" size="lg" block onClick={() => onMultiplayer(difficulty)}>
          Play 1v1
        </Button>
      </div>
    </div>
  )
}
