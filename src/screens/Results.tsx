import { useEffect } from 'react'
import type { SpOutcome } from '../net/useSingleplayer'
import type { MpOutcome } from '../net/useMultiplayer'
import { Button } from '../ui/Button'
import { winConfetti } from '../ui/confetti'

interface Props {
  outcome: SpOutcome | MpOutcome
  me: string
  rematchVotes: string[]
  onPlayAgain: () => void
  onRematch: () => void
  onHome: () => void
}

function ResultBadge({ won }: { won: boolean }) {
  return (
    <div
      className={`px-6 py-2 text-4xl font-black uppercase tracking-tight text-white ${
        won ? 'bg-[#1f9d55]' : 'bg-[#e23b3b]'
      }`}
    >
      {won ? 'You win' : 'You lose'}
    </div>
  )
}

export function Results({ outcome, me, rematchVotes, onPlayAgain, onRematch, onHome }: Props) {
  const didWin = outcome.mode === 'sp' ? outcome.reason === 'cleared' : outcome.winner === me
  useEffect(() => {
    if (didWin) winConfetti()
  }, [didWin])

  if (outcome.mode === 'sp') {
    return (
      <div className="my-auto flex w-full max-w-sm flex-col items-center gap-5 text-center">
        <ResultBadge won={didWin} />
        <div>
          <div className="text-7xl font-black tabular-nums">{outcome.score}</div>
          <div className="text-sm font-black uppercase tracking-widest text-neutral-400">points</div>
          {outcome.isNewScore ? (
            <div className="mt-1 text-sm font-black uppercase tracking-widest text-[#1f9d55]">
              New best!
            </div>
          ) : (
            <div className="mt-1 text-sm font-black uppercase tracking-widest text-neutral-400">
              Best {outcome.best.score}
            </div>
          )}
        </div>
        <div className="flex w-full justify-center gap-8">
          <div>
            <div className="text-3xl font-black tabular-nums">
              {outcome.matched}/{outcome.pairs}
            </div>
            <div className="text-xs font-black uppercase tracking-widest text-neutral-400">pairs</div>
          </div>
          <div>
            <div className="text-3xl font-black tabular-nums">{outcome.durationSec}s</div>
            <div className="text-xs font-black uppercase tracking-widest text-neutral-400">
              {outcome.isNewTime ? 'best time!' : 'time'}
            </div>
          </div>
        </div>
        <div className="grid w-full gap-2">
          <Button variant="primary" size="lg" block onClick={onPlayAgain}>
            Play again
          </Button>
          <Button variant="ghost" size="sm" block onClick={onHome}>
            ← Home
          </Button>
        </div>
      </div>
    )
  }

  const myScore = outcome.scores[me] ?? 0
  const opp = outcome.players.find((p) => p.id !== me)
  const oppScore = opp ? outcome.scores[opp.id] ?? 0 : 0
  const tie = outcome.winner === 'tie'
  const won = outcome.winner === me
  const title = outcome.opponentLeft ? 'Opponent left' : tie ? 'Tie game' : won ? 'You win' : 'You lose'
  const iVoted = rematchVotes.includes(me)

  return (
    <div className="my-auto flex w-full max-w-sm flex-col items-center gap-5 text-center">
      <h2 className="text-4xl font-black">{title}</h2>

      <div className="flex items-end justify-center gap-8">
        <div>
          <div className="text-5xl font-black tabular-nums text-[#1f9d55]">{myScore}</div>
          <div className="text-xs font-black uppercase tracking-widest text-neutral-400">You</div>
        </div>
        <div className="pb-1 text-2xl font-black text-neutral-300">vs</div>
        <div>
          <div className="text-5xl font-black tabular-nums text-[#2b6ce4]">{oppScore}</div>
          <div className="max-w-[8rem] truncate text-xs font-black uppercase tracking-widest text-neutral-400">
            {opp?.name ?? 'Rival'}
          </div>
        </div>
      </div>

      <div className="grid w-full gap-2">
        {!outcome.opponentLeft && (
          <Button variant="info" size="lg" block disabled={iVoted} onClick={onRematch}>
            {iVoted ? `Waiting… (${rematchVotes.length}/2)` : 'Rematch'}
          </Button>
        )}
        <Button variant="ghost" size="sm" block onClick={onHome}>
          ← Home
        </Button>
      </div>
    </div>
  )
}
