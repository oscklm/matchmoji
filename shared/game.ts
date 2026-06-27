import type { DifficultyConfig } from './difficulty'
import { pickEmojis } from './emojis'

export interface Card {
  id: number
  emoji: string
  matched: boolean
}

export interface PublicCard {
  id: number
  matched: boolean
  emoji: string | null // null = face down for the viewing player
}

/** A view personalized for one player — opponent's in-progress flips are hidden. */
export interface PublicView {
  cards: PublicCard[]
  mySelection: number[]
  scores: Record<string, number>
  combos: Record<string, number>
  movesLeft: Record<string, number | null> // null = unlimited
}

export type FlipResult =
  | { type: 'noop' }
  | { type: 'reveal'; playerId: string }
  | { type: 'match'; playerId: string; cards: [number, number]; gained: number; combo: number }
  | { type: 'mismatch'; playerId: string; cards: [number, number] }
  | { type: 'stale'; playerId: string }

export const MATCH_BASE = 100
export const STREAK_STEP = 50
export const FLIP_BACK_MS = 300

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
  const chosen = pickEmojis(config.pool, config.pairs)
  const cards: Card[] = []
  for (const emoji of chosen) {
    cards.push({ id: -1, emoji, matched: false })
    cards.push({ id: -1, emoji, matched: false })
  }
  shuffle(cards)
  cards.forEach((c, i) => (c.id = i))
  return cards
}

/**
 * Framework-agnostic game engine. Owns board, per-player selections, scores,
 * combos and move budgets. No timers — the caller schedules flip-back / end.
 * Shared by the singleplayer client engine and the authoritative MP server.
 */
export class GameCore {
  board: Card[]
  selections = new Map<string, number[]>()
  scores = new Map<string, number>()
  combos = new Map<string, number>()
  movesUsed = new Map<string, number>()
  readonly moveLimit: number | null

  constructor(public config: DifficultyConfig, playerIds: string[], board?: Card[]) {
    this.board = board ?? makeBoard(config)
    this.moveLimit = config.moves
    for (const p of playerIds) this.addPlayer(p)
  }

  addPlayer(playerId: string) {
    if (this.selections.has(playerId)) return
    this.selections.set(playerId, [])
    this.scores.set(playerId, 0)
    this.combos.set(playerId, 0)
    this.movesUsed.set(playerId, 0)
  }

  private exhausted(playerId: string): boolean {
    return this.moveLimit !== null && (this.movesUsed.get(playerId) ?? 0) >= this.moveLimit
  }

  /** A player is finished when out of moves with nothing pending. */
  playerDone(playerId: string): boolean {
    return this.exhausted(playerId) && (this.selections.get(playerId)?.length ?? 0) === 0
  }

  allDone(): boolean {
    if (this.moveLimit === null) return false
    return [...this.selections.keys()].every((p) => this.playerDone(p))
  }

  flip(playerId: string, cardId: number): FlipResult {
    let sel = this.selections.get(playerId)
    if (!sel) return { type: 'noop' }
    // Drop any of my picks sniped (matched) by someone else — no penalty.
    if (sel.some((id) => this.board[id]?.matched)) {
      sel = sel.filter((id) => !this.board[id]?.matched)
      this.selections.set(playerId, sel)
    }
    if (sel.length >= 2) return { type: 'noop' } // awaiting flip-back
    if (sel.length === 0 && this.exhausted(playerId)) return { type: 'noop' } // out of moves
    const card = this.board[cardId]
    if (!card || card.matched) return { type: 'noop' }
    if (sel.includes(cardId)) return { type: 'noop' }

    sel.push(cardId)
    if (sel.length === 1) return { type: 'reveal', playerId }

    const [a, b] = sel
    const ca = this.board[a]
    const cb = this.board[b]

    if (ca.matched || cb.matched) {
      this.selections.set(playerId, [])
      return { type: 'stale', playerId } // sniped between picks — doesn't cost a move
    }

    // A completed pair attempt costs one move.
    this.movesUsed.set(playerId, (this.movesUsed.get(playerId) ?? 0) + 1)

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

    this.combos.set(playerId, 0)
    return { type: 'mismatch', playerId, cards: [a, b] }
  }

  clearSelection(playerId: string) {
    this.selections.set(playerId, [])
  }

  isComplete(): boolean {
    return this.board.every((c) => c.matched)
  }

  private movesLeftMap(): Record<string, number | null> {
    const out: Record<string, number | null> = {}
    for (const p of this.selections.keys()) {
      out[p] = this.moveLimit === null ? null : Math.max(0, this.moveLimit - (this.movesUsed.get(p) ?? 0))
    }
    return out
  }

  /** Personalized view: reveals matched cards plus only THIS player's picks. */
  viewFor(playerId: string): PublicView {
    const mySel = this.selections.get(playerId) ?? []
    const reveal = new Set<number>(mySel)
    return {
      cards: this.board.map((c) => ({
        id: c.id,
        matched: c.matched,
        emoji: c.matched || reveal.has(c.id) ? c.emoji : null,
      })),
      mySelection: [...mySel],
      scores: Object.fromEntries(this.scores),
      combos: Object.fromEntries(this.combos),
      movesLeft: this.movesLeftMap(),
    }
  }
}
