import type { SpOutcome } from '../net/useSingleplayer'
import type { MpOutcome } from '../net/useMultiplayer'

interface Props {
  outcome: SpOutcome | MpOutcome
  me: string
  rematchVotes: string[]
  onPlayAgain: () => void
  onRematch: () => void
  onHome: () => void
}

export function Results({ outcome, me, rematchVotes, onPlayAgain, onRematch, onHome }: Props) {
  if (outcome.mode === 'sp') {
    const won = outcome.result === 'cleared'
    return (
      <Shell
        emoji={won ? '🏆' : '⏳'}
        title={won ? 'Board cleared!' : "Time's up"}
        tint={won ? 'text-emerald-300' : 'text-rose-300'}
      >
        <p className="text-5xl font-black tabular-nums text-white">{outcome.score}</p>
        <p className="text-sm font-semibold text-white/50">points</p>
        <Buttons primaryLabel="Play again" onPrimary={onPlayAgain} onHome={onHome} />
      </Shell>
    )
  }

  const myScore = outcome.scores[me] ?? 0
  const opp = outcome.players.find((p) => p.id !== me)
  const oppScore = opp ? outcome.scores[opp.id] ?? 0 : 0
  const tie = outcome.winner === 'tie'
  const won = outcome.winner === me

  const title = outcome.opponentLeft
    ? 'Opponent left'
    : tie
      ? "It's a tie!"
      : won
        ? 'You win!'
        : 'You lose'
  const emoji = outcome.opponentLeft ? '👋' : tie ? '🤝' : won ? '🏆' : '😵'
  const tint = won || outcome.opponentLeft ? 'text-emerald-300' : tie ? 'text-amber-300' : 'text-rose-300'

  const iVoted = rematchVotes.includes(me)

  return (
    <Shell emoji={emoji} title={title} tint={tint}>
      <div className="flex items-end justify-center gap-6">
        <Score label="You" value={myScore} highlight={won} color="text-emerald-300" />
        <span className="pb-2 text-2xl font-black text-white/30">vs</span>
        <Score label={opp?.name ?? 'Rival'} value={oppScore} highlight={!won && !tie} color="text-fuchsia-300" />
      </div>

      {outcome.opponentLeft ? (
        <button
          type="button"
          onClick={onHome}
          className="mt-2 w-full rounded-2xl bg-emerald-500 py-3.5 text-lg font-black text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400"
        >
          Home
        </button>
      ) : (
        <div className="mt-2 w-full space-y-3">
          <button
            type="button"
            onClick={onRematch}
            disabled={iVoted}
            className="w-full rounded-2xl bg-fuchsia-500 py-3.5 text-lg font-black text-white shadow-lg shadow-fuchsia-500/30 transition enabled:hover:bg-fuchsia-400 disabled:opacity-50"
          >
            {iVoted ? `Waiting… (${rematchVotes.length}/2)` : '↻ Rematch'}
          </button>
          <button type="button" onClick={onHome} className="w-full text-sm font-bold text-white/50 hover:text-white">
            Home
          </button>
        </div>
      )}
    </Shell>
  )
}

function Shell({
  emoji,
  title,
  tint,
  children,
}: {
  emoji: string
  title: string
  tint: string
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-3xl bg-white/5 p-8 text-center ring-1 ring-white/10">
      <div className="animate-pop text-6xl">{emoji}</div>
      <h2 className={`text-3xl font-black ${tint}`}>{title}</h2>
      {children}
    </div>
  )
}

function Score({
  label,
  value,
  highlight,
  color,
}: {
  label: string
  value: number
  highlight: boolean
  color: string
}) {
  return (
    <div className={`flex flex-col items-center ${highlight ? '' : 'opacity-60'}`}>
      <span className={`text-4xl font-black tabular-nums ${color}`}>{value}</span>
      <span className="max-w-[7rem] truncate text-xs font-bold text-white/50">{label}</span>
    </div>
  )
}

function Buttons({
  primaryLabel,
  onPrimary,
  onHome,
}: {
  primaryLabel: string
  onPrimary: () => void
  onHome: () => void
}) {
  return (
    <div className="mt-2 w-full space-y-3">
      <button
        type="button"
        onClick={onPrimary}
        className="w-full rounded-2xl bg-emerald-500 py-3.5 text-lg font-black text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400"
      >
        {primaryLabel}
      </button>
      <button type="button" onClick={onHome} className="w-full text-sm font-bold text-white/50 hover:text-white">
        Home
      </button>
    </div>
  )
}
