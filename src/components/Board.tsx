import { useLayoutEffect, useRef, useState } from 'react'
import type { PublicView } from '../../shared/game'
import type { DifficultyConfig } from '../../shared/difficulty'
import { Card } from './Card'

const GAP = 8
const MAX_CARD = 132
// A little breathing room kept below the grid so the bottom row never hugs
// the screen edge (hard to tap on mobile).
const SAFE_Y = 12
// Below this width we treat it as a phone and use a fixed, portrait-friendly
// column count so every phone renders the same grid shape.
const PHONE_MAX_W = 560
const PHONE_COLS = 4

interface Props {
  view: PublicView
  config: DifficultyConfig
  locked: boolean
  onFlip: (id: number) => void
}

export function Board({ view, config, locked, onFlip }: Props) {
  const mySel = view.mySelection
  const myFull = mySel.length >= 2
  const n = view.cards.length

  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.contentRect
      setBox({ w: r.width, h: r.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const measured = box.w > 0 && box.h > 0
  const phone = measured && box.w <= PHONE_MAX_W
  const cols = phone && n % PHONE_COLS === 0 ? PHONE_COLS : config.cols
  const rows = Math.ceil(n / cols)

  // Card size that fits BOTH the available width and height — never scrolls.
  const cardW = (box.w - (cols - 1) * GAP) / cols
  const cardH = (box.h - SAFE_Y - (rows - 1) * GAP) / rows
  const size = measured ? Math.max(0, Math.min(cardW, cardH, MAX_CARD)) : 0
  const width = measured ? cols * size + (cols - 1) * GAP : '100%'

  return (
    <div ref={ref} className="flex h-full w-full items-start justify-center overflow-hidden">
      <div
        className="grid"
        style={{ gap: GAP, width, gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {view.cards.map((card) => {
          const mine = mySel.includes(card.id)
          const disabled = locked || card.matched || mine || myFull
          return (
            <Card key={card.id} card={card} mine={mine} disabled={disabled} onClick={() => onFlip(card.id)} />
          )
        })}
      </div>
    </div>
  )
}
