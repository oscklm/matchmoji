import type { DifficultyConfig } from './difficulty'
import { poolFor } from './emojis'

export interface Card {
  id: number
  emoji: string
  matched: boolean
}

export interface PublicCard {
  id: number
  matched: boolean
  emoji: string | null // null = face down (not revealed to anyone)
}

export interface PublicView {
  cards: PublicCard[]
  selections: Record<string, number[]>
  scores: Record<string, number>
  combos: Record<string, number>
}

export type FlipResult =
  | { type: 'noop' }
  | { type: 'reveal'; playerId: string }
  | { type: 'match'; playerId: string; cards: [number, number]; gained: number; combo: number }
  | { type: 'mismatch'; playerId: string; cards: [number, number] }
  | { type: 'stale'; playerId: string } // a card got sniped between my two picks

export const MATCH_BASE = 100
export const STREAK_STEP = 50
export const FLIP_BACK_MS = 800
export const CLEAR_BONUS_PER_SEC = 10

export function scoreForMatch(combo: number): number {
  return MATCH_BASE + Math.max(0, combo - 1) * STREAK_STEP
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function makeBoard(config: DifficultyConfig): Card[] {
  const chosen = shuffle([...poolFor(config.pool)]).slice(0, config.pairs)
  const cards: Card[] = []
  for (const emoji of chosen) {
    cards.push({ id: -1, emoji, matched: false })
    cards.push({ id: -1, emoji, matched: false })
  }
  shuffle(cards)
  // Assign ids after shuffling so the array is indexable by id (board[id])
  // while positions stay randomized.
  cards.forEach((c, i) => (c.id = i))
  return cards
}

/**
 * Framework-agnostic game engine. Owns board + per-player selections, scores
 * and combos. No timers — the caller schedules flip-back / end. Shared by the
 * singleplayer client engine and the authoritative multiplayer server.
 */
export class GameCore {
  board: Card[]
  selections = new Map<string, number[]>()
  scores = new Map<string, number>()
  combos = new Map<string, number>()

  constructor(public config: DifficultyConfig, playerIds: string[], board?: Card[]) {
    this.board = board ?? makeBoard(config)
    for (const p of playerIds) this.addPlayer(p)
  }

  addPlayer(playerId: string) {
    if (this.selections.has(playerId)) return
    this.selections.set(playerId, [])
    this.scores.set(playerId, 0)
    this.combos.set(playerId, 0)
  }

  flip(playerId: string, cardId: number): FlipResult {
    let sel = this.selections.get(playerId)
    if (!sel) return { type: 'noop' }
    // Drop any of my picks that were matched (sniped) by someone else — no penalty.
    if (sel.some((id) => this.board[id]?.matched)) {
      sel = sel.filter((id) => !this.board[id]?.matched)
      this.selections.set(playerId, sel)
    }
    if (sel.length >= 2) return { type: 'noop' } // awaiting flip-back
    const card = this.board[cardId]
    if (!card || card.matched) return { type: 'noop' }
    if (sel.includes(cardId)) return { type: 'noop' }

    sel.push(cardId)
    if (sel.length === 1) return { type: 'reveal', playerId }

    const [a, b] = sel
    const ca = this.board[a]
    const cb = this.board[b]

    // Sniped: one of my picks was matched by someone else between flips.
    if (ca.matched || cb.matched) {
      this.selections.set(playerId, [])
      return { type: 'stale', playerId } // no combo penalty — wasn't a wrong guess
    }

    if (ca.emoji === cb.emoji) {
      ca.matched = true
      cb.matched = true
      const combo = (this.combos.get(playerId) ?? 0) + 1
      this.combos.set(playerId, combo)
      const gained = scoreForMatch(combo)
      this.scores.set(playerId, (this.scores.get(playerId) ?? 0) + gained)
      this.selections.set(playerId, [])
      return { type: 'match', playerId, cards: [a, b], gained, combo }
    }

    // Wrong guess — reset combo, hold selection for the flip-back window.
    this.combos.set(playerId, 0)
    return { type: 'mismatch', playerId, cards: [a, b] }
  }

  clearSelection(playerId: string) {
    this.selections.set(playerId, [])
  }

  isComplete(): boolean {
    return this.board.every((c) => c.matched)
  }

  view(): PublicView {
    const revealed = new Set<number>()
    for (const c of this.board) if (c.matched) revealed.add(c.id)
    for (const sel of this.selections.values()) for (const id of sel) revealed.add(id)
    return {
      cards: this.board.map((c) => ({
        id: c.id,
        matched: c.matched,
        emoji: revealed.has(c.id) ? c.emoji : null,
      })),
      selections: Object.fromEntries(this.selections),
      scores: Object.fromEntries(this.scores),
      combos: Object.fromEntries(this.combos),
    }
  }
}
