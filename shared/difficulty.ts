export type Difficulty = 'easy' | 'hard' | 'hardcore'

export type Pool = 'distinct' | 'mixed' | 'lookalike'

export interface DifficultyConfig {
  key: Difficulty
  label: string
  blurb: string
  pairs: number
  cols: number
  rows: number
  timer: number // seconds
  pool: Pool
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    key: 'easy',
    label: 'Easy',
    blurb: 'Distinct emojis, roomy timer',
    pairs: 6,
    cols: 4,
    rows: 3,
    timer: 90,
    pool: 'distinct',
  },
  hard: {
    key: 'hard',
    label: 'Hard',
    blurb: 'Some lookalikes, tighter clock',
    pairs: 8,
    cols: 4,
    rows: 4,
    timer: 70,
    pool: 'mixed',
  },
  hardcore: {
    key: 'hardcore',
    label: 'Hardcore',
    blurb: 'All smileys, blink and you lose',
    pairs: 10,
    cols: 5,
    rows: 4,
    timer: 50,
    pool: 'lookalike',
  },
}

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'hard', 'hardcore']

export function validDifficulty(d: unknown): Difficulty {
  return d === 'easy' || d === 'hard' || d === 'hardcore' ? d : 'easy'
}
