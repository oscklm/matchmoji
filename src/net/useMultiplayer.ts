import { useCallback, useEffect, useRef, useState } from 'react'
import type { PublicView } from '../../shared/game'
import { type Difficulty } from '../../shared/difficulty'
import { getSocket } from './socket'
import { comboConfetti } from '../ui/confetti'
import { gameStarted, gameCompleted } from '../analytics'

export interface PlayerInfo {
  id: string
  name: string
}

export type MpPhase = 'idle' | 'lobby' | 'countdown' | 'playing' | 'over'

export interface MpOutcome {
  mode: 'mp'
  scores: Record<string, number>
  winner: string | 'tie'
  players: PlayerInfo[]
  opponentLeft?: boolean
}

export function useMultiplayer(me: string, name: string) {
  const [phase, setPhase] = useState<MpPhase>('idle')
  const [code, setCode] = useState('')
  const [players, setPlayers] = useState<PlayerInfo[]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [view, setView] = useState<PublicView | null>(null)
  const [endTime, setEndTime] = useState(0)
  const [over, setOver] = useState<MpOutcome | null>(null)
  const [error, setError] = useState('')
  const [rematchVotes, setRematchVotes] = useState<string[]>([])
  const nameRef = useRef(name)
  nameRef.current = name
  const startTimeRef = useRef(0)
  const difficultyRef = useRef<Difficulty>('easy')

  useEffect(() => {
    const s = getSocket()
    const onRoom = (d: { code: string; difficulty: Difficulty; players: PlayerInfo[] }) => {
      setCode(d.code)
      setDifficulty(d.difficulty)
      setPlayers(d.players)
    }
    const onCountdown = ({ n }: { n: number }) => {
      setOver(null)
      setRematchVotes([])
      setCountdown(n)
      setPhase('countdown')
    }
    const onStart = (d: {
      view: PublicView
      endTime: number
      difficulty: Difficulty
      players: PlayerInfo[]
    }) => {
      setView(d.view)
      setEndTime(d.endTime)
      setDifficulty(d.difficulty)
      setPlayers(d.players)
      setCountdown(null)
      setPhase('playing')
      startTimeRef.current = Date.now()
      difficultyRef.current = d.difficulty
      gameStarted({ mode: 'mp', difficulty: d.difficulty })
    }
    const onState = (v: PublicView) => setView(v)
    const onOver = (d: { scores: Record<string, number>; winner: string | 'tie'; players: PlayerInfo[] }) => {
      setOver({ mode: 'mp', scores: d.scores, winner: d.winner, players: d.players })
      setPhase('over')
      gameCompleted({
        mode: 'mp',
        difficulty: difficultyRef.current,
        outcome: d.winner === 'tie' ? 'tie' : d.winner === me ? 'win' : 'lose',
        won: d.winner === me,
        score: d.scores[me] ?? 0,
        durationSec: Math.round((Date.now() - startTimeRef.current) / 1000),
      })
    }
    const onLeft = () => {
      setOver((prev) => ({
        mode: 'mp',
        scores: prev?.scores ?? {},
        winner: me,
        players: prev?.players ?? players,
        opponentLeft: true,
      }))
      setPhase('over')
    }
    const onRematch = (d: { votes: string[] }) => setRematchVotes(d.votes)
    const onCombo = (d: { combo: number }) => comboConfetti(d.combo)

    s.on('room:update', onRoom)
    s.on('game:combo', onCombo)
    s.on('game:countdown', onCountdown)
    s.on('game:start', onStart)
    s.on('game:state', onState)
    s.on('game:over', onOver)
    s.on('opponent:left', onLeft)
    s.on('rematch:update', onRematch)
    return () => {
      s.off('room:update', onRoom)
      s.off('game:combo', onCombo)
      s.off('game:countdown', onCountdown)
      s.off('game:start', onStart)
      s.off('game:state', onState)
      s.off('game:over', onOver)
      s.off('opponent:left', onLeft)
      s.off('rematch:update', onRematch)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me])

  const createRoom = useCallback(
    (d: Difficulty) => {
      setError('')
      getSocket().emit('room:create', { difficulty: d, name: nameRef.current, deviceId: me }, (r: { code?: string }) => {
        if (r?.code) {
          setCode(r.code)
          setDifficulty(d)
          setPhase('lobby')
        }
      })
    },
    [me],
  )

  const joinRoom = useCallback(
    (c: string) => {
      setError('')
      getSocket().emit(
        'room:join',
        { code: c, name: nameRef.current, deviceId: me },
        (r: { code?: string; error?: string }) => {
          if (r?.error) setError(r.error)
          else if (r?.code) {
            setCode(r.code)
            setPhase('lobby')
          }
        },
      )
    },
    [me],
  )

  const flip = useCallback((id: number) => getSocket().emit('game:flip', { cardId: id }), [])
  const rematch = useCallback(() => getSocket().emit('game:rematch'), [])
  const leave = useCallback(() => {
    getSocket().emit('room:leave')
    setPhase('idle')
    setCode('')
    setPlayers([])
    setView(null)
    setOver(null)
    setError('')
    setRematchVotes([])
  }, [])

  return {
    phase,
    code,
    players,
    difficulty,
    countdown,
    view,
    endTime,
    over,
    error,
    rematchVotes,
    me,
    createRoom,
    joinRoom,
    flip,
    rematch,
    leave,
  }
}
