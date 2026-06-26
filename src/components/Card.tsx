import type { PublicCard } from '../../shared/game'

interface Props {
  card: PublicCard
  mine: boolean
  rival: boolean
  disabled: boolean
  onClick: () => void
}

export function Card({ card, mine, rival, disabled, onClick }: Props) {
  const up = card.emoji !== null
  const ring = mine
    ? 'ring-4 ring-emerald-400'
    : rival
      ? 'ring-4 ring-fuchsia-400'
      : 'ring-0'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flip relative aspect-square w-full rounded-2xl ${ring} transition-shadow`}
    >
      <div className={`flip-inner ${card.matched ? 'is-matched' : up ? 'is-up' : ''}`}>
        <div className="face face-back bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl text-white/40 shadow-lg shadow-violet-900/40">
          <span className="select-none">★</span>
        </div>
        <div className="face face-front bg-slate-100 text-[clamp(1.4rem,7vw,2.6rem)] shadow-lg">
          <span className="animate-pop leading-none">{card.emoji}</span>
        </div>
      </div>
    </button>
  )
}
