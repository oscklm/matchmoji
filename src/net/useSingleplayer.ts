import { useCallback, useEffect, useRef, useState } from 'react'
import { GameCore, CLEAR_BONUS_PER_SEC, FLIP_BACK_MS, type PublicView } from '../../shared/game'
import { DIFFICULTIES, type Difficulty } from '../../shared/difficulty'

export interface SpOutcome {
  mode: 'sp'
  result: 'cleared' | 'timeup'
  score: number
}

export function useSingleplayer(difficulty: Difficulty, me: string) {
  const config = DIFFICULTIES[difficulty]
  const coreRef = useRef<GameCore | null>(null)
  const overRef = useRef(false)
  const endTimeRef = useRef(0)

  const [view, setView] = useState<PublicView | null>(null)
  const [endTime, setEndTime] = useState(0)
  const [countdown, setCountdown] = useState<number | null>(3)
  const [over, setOver] = useState<SpOutcome | null>(null)

  const start = useCallback(() => {
    const core = new GameCore(config, [me])
    coreRef.current = core
    overRef.current = false
    setOver(null)
    setView(core.view())
    setEndTime(0)
    setCountdown(3)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, me])

  useEffect(() => {
    start()
  }, [start])

  const finish = useCallback(
    (result: 'cleared' | 'timeup') => {
      if (overRef.current) return
      overRef.current = true
      const core = coreRef.current!
      let score = core.scores.get(me) ?? 0
      if (result === 'cleared') {
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000))
        score += remaining * CLEAR_BONUS_PER_SEC
      }
      setOver({ mode: 'sp', result, score })
    },
    [me],
  )

  // Countdown 3 -> 2 -> 1 -> go
  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      const end = Date.now() + config.timer * 1000
      endTimeRef.current = end
      setEndTime(end)
      setCountdown(null)
      return
    }
    const t = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000)
    return () => clearTimeout(t)
  }, [countdown, config.timer])

  // Time-up watcher
  useEffect(() => {
    if (countdown !== null || over) return
    const iv = setInterval(() => {
      if (Date.now() >= endTimeRef.current) finish('timeup')
    }, 200)
    return () => clearInterval(iv)
  }, [countdown, over, finish])

  const flip = useCallback(
    (id: number) => {
      const core = coreRef.current
      if (!core || countdown !== null || overRef.current) return
      const res = core.flip(me, id)
      if (res.type === 'noop') return
      setView(core.view())
      if (res.type === 'mismatch') {
        setTimeout(() => {
          core.clearSelection(me)
          setView(core.view())
        }, FLIP_BACK_MS)
      } else if (res.type === 'match' && core.isComplete()) {
        finish('cleared')
      }
    },
    [countdown, me, finish],
  )

  return { config, me, view, endTime, countdown, over, flip, restart: start }
}
