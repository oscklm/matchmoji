import { useCallback, useEffect, useRef, useState } from 'react'
import { GameCore, FLIP_BACK_MS, type PublicView } from '../../shared/game'
import { DIFFICULTIES, type Difficulty } from '../../shared/difficulty'
import { comboConfetti } from '../ui/confetti'

export interface SpOutcome {
  mode: 'sp'
  score: number
  reason: 'cleared' | 'timeup' | 'nomoves'
}

export function useSingleplayer(difficulty: Difficulty, me: string, showCountdown = true) {
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
    setView(core.viewFor(me))
    setEndTime(0)
    setCountdown(showCountdown ? 3 : 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, me, showCountdown])

  useEffect(() => {
    start()
  }, [start])

  const finish = useCallback((reason: SpOutcome['reason']) => {
    if (overRef.current) return
    overRef.current = true
    const score = coreRef.current!.scores.get(me) ?? 0
    setOver({ mode: 'sp', score, reason })
  }, [me])

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
      setView(core.viewFor(me))
      if (res.type === 'mismatch') {
        setTimeout(() => {
          core.clearSelection(me)
          setView(core.viewFor(me))
          if (core.playerDone(me)) finish('nomoves')
        }, FLIP_BACK_MS)
      } else if (res.type === 'match') {
        if (res.combo >= 2) comboConfetti(res.combo)
        if (core.isComplete()) finish('cleared')
        else if (core.playerDone(me)) finish('nomoves')
      }
    },
    [countdown, me, finish],
  )

  return { config, me, view, endTime, countdown, over, flip, restart: start }
}
