import type { PublicView } from '../../shared/game'
import type { DifficultyConfig } from '../../shared/difficulty'
import type { PlayerInfo } from '../net/useMultiplayer'
import { Board } from '../components/Board'
import { Hud } from '../components/Hud'

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
    <div className="relative flex w-full max-w-xl flex-col items-center gap-5">
      <div className="flex w-full max-w-xl items-center justify-between">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-300">
          {config.label}
        </span>
        <button type="button" onClick={onQuit} className="text-xs font-bold text-white/40 hover:text-white">
          Quit ✕
        </button>
      </div>

      <Hud
        endTime={countdown === null ? endTime : 0}
        totalSeconds={config.timer}
        players={players}
        scores={view?.scores ?? {}}
        combos={view?.combos ?? {}}
        me={me}
      />

      {view && (
        <Board view={view} config={config} me={me} locked={countdown !== null} onFlip={onFlip} />
      )}

      {countdown !== null && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-slate-950/70 backdrop-blur-sm">
          <div key={countdown} className="animate-pop text-8xl font-black text-amber-300">
            {countdown === 0 ? 'GO!' : countdown}
          </div>
        </div>
      )}
    </div>
  )
}
