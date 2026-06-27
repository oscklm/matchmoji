import type { Difficulty } from '../shared/difficulty'

const KEY = 'matchmoji:highscores'

export interface Highscore {
  score: number
  time: number // fastest clear in seconds; 0 = none yet
}

export type Store = Partial<Record<Difficulty, Highscore>>

function coerce(v: unknown): Highscore {
  if (typeof v === 'number') return { score: v, time: 0 }
  if (v && typeof v === 'object') {
    const o = v as Partial<Highscore>
    return { score: o.score ?? 0, time: o.time ?? 0 }
  }
  return { score: 0, time: 0 }
}

function read(): Store {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}')
    const out: Store = {}
    for (const k in raw) out[k as Difficulty] = coerce(raw[k])
    return out
  } catch {
    return {}
  }
}

export function getHighscore(difficulty: Difficulty): Highscore {
  return read()[difficulty] ?? { score: 0, time: 0 }
}

export function getAllHighscores(): Store {
  return read()
}

// Records a result, returns the previous best and whether each was beaten.
// time is only considered on a cleared board.
export function recordScore(
  difficulty: Difficulty,
  score: number,
  time: number,
  cleared: boolean,
) {
  const store = read()
  const prev = store[difficulty] ?? { score: 0, time: 0 }
  const isNewScore = score > prev.score
  const isNewTime = cleared && (prev.time === 0 || time < prev.time)
  const next: Highscore = {
    score: isNewScore ? score : prev.score,
    time: isNewTime ? time : prev.time,
  }
  if (isNewScore || isNewTime) {
    store[difficulty] = next
    localStorage.setItem(KEY, JSON.stringify(store))
  }
  return { prev, best: next, isNewScore, isNewTime }
}
