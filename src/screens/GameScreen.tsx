import type { PublicView } from '../../shared/game'
import type { DifficultyConfig } from '../../shared/difficulty'
import type { PlayerInfo } from '../net/useMultiplayer'
import { Board } from '../components/Board'
import { Hud } from '../components/Hud'
import { RainbowText } from '../components/RainbowText'
import { Button } from '../ui/Button'

interface Props {
  config: DifficultyConfig
  me: string
  players: PlayerInfo[]
  view: PublicView | null
  endTime: number
  countdown: number | null
  onFlip: (id: number) => void
  onQuit: () => void
}

export function GameScreen({ config, me, players, view, endTime, countdown, onFlip, onQuit }: Props) {
  return (
    <div className="relative flex w-full max-w-xl flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between">
        <span className="text-lg font-black uppercase tracking-widest">
          {config.rainbow ? <RainbowText text={config.label} /> : config.label}
        </span>
        <Button variant="outline" size="sm" onClick={onQuit}>
          Quit
        </Button>
      </div>

      <Hud
        endTime={countdown === null ? endTime : 0}
        totalSeconds={config.timer}
        players={players}
        scores={view?.scores ?? {}}
        combos={view?.combos ?? {}}
        movesLeft={view?.movesLeft ?? {}}
        me={me}
      />

      {view && <Board view={view} config={config} locked={countdown !== null} onFlip={onFlip} />}

      {countdown !== null && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#faf9f6]">
          <div key={countdown} className="animate-pop text-8xl font-black">
            {countdown === 0 ? 'GO' : countdown}
          </div>
        </div>
      )}
    </div>
  )
}
