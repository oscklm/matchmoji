import confetti from 'canvas-confetti'

// Tailwind CSS palette (the 400/500 shades) for a bright, varied burst.
const TAILWIND_COLORS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
]

/** Fires a confetti burst inward from each side of the screen. */
export function comboConfetti(combo: number) {
  const particleCount = Math.min(60 + combo * 15, 160)
  const shared = {
    particleCount,
    spread: 70,
    startVelocity: 55,
    ticks: 200,
    colors: TAILWIND_COLORS,
    zIndex: 9999,
  }
  confetti({ ...shared, angle: 60, origin: { x: 0, y: 0.7 } })
  confetti({ ...shared, angle: 120, origin: { x: 1, y: 0.7 } })
}

/** A bigger celebratory burst for winning — wide fan plus side cannons. */
export function winConfetti() {
  confetti({
    particleCount: 180,
    spread: 120,
    startVelocity: 45,
    ticks: 250,
    origin: { x: 0.5, y: 0.6 },
    colors: TAILWIND_COLORS,
    zIndex: 9999,
  })
  comboConfetti(4)
}
