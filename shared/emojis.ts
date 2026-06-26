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

export function poolFor(pool: Pool): string[] {
  switch (pool) {
    case 'distinct':
      return DISTINCT
    case 'lookalike':
      return LOOKALIKE
    case 'mixed':
      return [...DISTINCT.slice(0, 14), ...LOOKALIKE.slice(0, 14)]
  }
}
