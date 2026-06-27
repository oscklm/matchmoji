import type { Pool } from './difficulty'

// Visually distinct, varied categories — easy to tell apart.
export const DISTINCT = [
  '🐶', '🍕', '🚀', '⚽', '🎸', '🌈', '🍎', '🐙', '🌵', '🎈',
  '🦊', '🍔', '🎩', '⛵', '🐝', '🍩', '🎮', '🌻', '🐢', '🔥',
  '🍉', '🐳', '🎯', '🪐', '🧩', '🦋', '🍄', '⚓', '🎺', '🪁',
]

// Smiley variants — deliberately hard to distinguish at a glance.
export const LOOKALIKE = [
  '😀', '😃', '😄', '😁', '😆', '😊', '🙂', '😉', '😌', '😍',
  '🥰', '😅', '😂', '🤣', '😇', '🙃', '😋', '😎', '🤩', '😜',
  '😝', '😏', '🥲', '😬', '😐', '😶', '🫠', '🤤', '😴', '🤗',
]

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Choose `count` distinct emojis for a board. Chaos is weighted 70% tricky
 *  lookalike faces / 30% distinct so most cards are the hard ones. */
export function pickEmojis(pool: Pool, count: number): string[] {
  if (pool === 'chaos') {
    const faces = Math.round(count * 0.7)
    return shuffled([
      ...shuffled(LOOKALIKE).slice(0, faces),
      ...shuffled(DISTINCT).slice(0, count - faces),
    ])
  }
  return shuffled(poolFor(pool)).slice(0, count)
}

export function poolFor(pool: Pool): string[] {
  switch (pool) {
    case 'distinct':
      return DISTINCT
    case 'lookalike':
      return LOOKALIKE
    case 'mixed':
      return [...DISTINCT.slice(0, 14), ...LOOKALIKE.slice(0, 14)]
    case 'chaos':
      // Everything — varied categories plus the tricky smiley variants.
      return [...DISTINCT, ...LOOKALIKE]
  }
}
