import type { PublicCard } from '../../shared/game'

interface Props {
  card: PublicCard
  mine: boolean
  disabled: boolean
  onClick: () => void
}

export function Card({ card, mine, disabled, onClick }: Props) {
  const up = card.emoji !== null
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flip relative aspect-square w-full"
    >
      <div className={`flip-inner ${card.matched ? 'is-matched' : up ? 'is-up' : ''}`}>
        <div className="face bg-[#2b2d42]">
          <img src="/logo-stamp.svg" alt="" draggable={false} aria-hidden className="w-2/5 object-contain opacity-10" />
        </div>
        <div
          className={`face face-front bg-white text-[clamp(1.6rem,7.8vw,3.1rem)] ${
            mine ? 'border-[3px] border-black' : 'border border-neutral-300'
          }`}
        >
          <span className="animate-pop leading-none">{card.emoji}</span>
        </div>
      </div>
    </button>
  )
}
