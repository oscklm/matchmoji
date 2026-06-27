import type { PublicView } from '../../shared/game'
import type { DifficultyConfig } from '../../shared/difficulty'
import { Card } from './Card'

interface Props {
  view: PublicView
  config: DifficultyConfig
  locked: boolean
  onFlip: (id: number) => void
}

export function Board({ view, config, locked, onFlip }: Props) {
  const mySel = view.mySelection
  const myFull = mySel.length >= 2

  return (
    <div
      className="mx-auto grid w-full max-w-xl gap-2"
      style={{ gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))` }}
    >
      {view.cards.map((card) => {
        const mine = mySel.includes(card.id)
        const disabled = locked || card.matched || mine || myFull
        return (
          <Card key={card.id} card={card} mine={mine} disabled={disabled} onClick={() => onFlip(card.id)} />
        )
      })}
    </div>
  )
}
