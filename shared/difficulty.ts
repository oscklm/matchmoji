export type Difficulty = 'easy' | 'medium' | 'hard' | 'zoomer'

export type Pool = 'distinct' | 'mixed' | 'lookalike'

export interface DifficultyConfig {
  key: Difficulty
  label: string
  blurb: string
  pairs: number
  cols: number
  timer: number // seconds
  moves: number | null // null = unlimited flips
  pool: Pool
  rainbow?: boolean
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    key: 'easy',
    label: 'Easy',
    blurb: 'Distinct emojis. Unlimited flips, just the clock.',
    pairs: 6,
    cols: 4,
    timer: 90,
    moves: null,
    pool: 'distinct',
  },
  medium: {
    key: 'medium',
    label: 'Medium',
    blurb: 'A few lookalikes. Limited moves — no spamming.',
    pairs: 8,
    cols: 4,
    timer: 70,
    moves: 14,
    pool: 'mixed',
  },
  hard: {
    key: 'hard',
    label: 'Hard',
    blurb: 'Lookalikes everywhere. Tight clock, tighter moves.',
    pairs: 10,
    cols: 5,
    timer: 55,
    moves: 15,
    pool: 'lookalike',
  },
  zoomer: {
    key: 'zoomer',
    label: 'ZOOMER',
    blurb: 'All smileys. 40 seconds. Reflexes only. Not for boomers.',
    pairs: 12,
    cols: 6,
    timer: 40,
    moves: 17,
    pool: 'lookalike',
    rainbow: true,
  },
}

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard', 'zoomer']

export function validDifficulty(d: unknown): Difficulty {
  return d === 'easy' || d === 'medium' || d === 'hard' || d === 'zoomer' ? d : 'easy'
}
