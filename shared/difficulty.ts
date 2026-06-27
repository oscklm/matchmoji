export type Difficulty = 'easy' | 'medium' | 'hard' | 'zoomer'

export type Pool = 'distinct' | 'mixed' | 'lookalike' | 'chaos'

export interface DifficultyConfig {
  key: Difficulty
  label: string
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
    pairs: 6,
    cols: 4,
    timer: 55,
    moves: null,
    pool: 'distinct',
  },
  medium: {
    key: 'medium',
    label: 'Medium',
    pairs: 8,
    cols: 4,
    timer: 45,
    moves: 14,
    pool: 'mixed',
  },
  hard: {
    key: 'hard',
    label: 'Hard',
    pairs: 10,
    cols: 5,
    timer: 40,
    moves: 15,
    pool: 'lookalike',
  },
  zoomer: {
    key: 'zoomer',
    label: 'ZOOMER',
    pairs: 14,
    cols: 7,
    timer: 48,
    moves: 19,
    pool: 'chaos',
    rainbow: true,
  },
}

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard', 'zoomer']

export function validDifficulty(d: unknown): Difficulty {
  return d === 'easy' || d === 'medium' || d === 'hard' || d === 'zoomer' ? d : 'easy'
}
