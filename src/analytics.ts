import type { Difficulty } from '../shared/difficulty'

type Mode = 'sp' | 'mp'

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, unknown>) => void }
  }
}

function track(event: string, data?: Record<string, unknown>) {
  window.umami?.track(event, data)
}

export function gameStarted(props: { mode: Mode; difficulty: Difficulty }) {
  track('game_started', props)
}

export function gameCompleted(props: {
  mode: Mode
  difficulty: Difficulty
  outcome: string // sp: cleared|timeup|nomoves · mp: win|lose|tie
  won: boolean
  score: number
  durationSec: number
}) {
  track('game_completed', props)
}

const RECORDER_SRC = 'https://analytics.oneguycloud.net/recorder.js'
const WEBSITE_ID = 'd1a5f101-99b1-4556-ab82-9f4eaa3d8196'
let recorderLoaded = false

/** Lazily load the Umami session recorder. Idempotent; called from menu screens. */
export function loadRecorder() {
  if (recorderLoaded) return
  recorderLoaded = true
  const s = document.createElement('script')
  s.defer = true
  s.src = RECORDER_SRC
  s.dataset.websiteId = WEBSITE_ID
  document.head.appendChild(s)
}
