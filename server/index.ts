import express from 'express'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import { Server } from 'socket.io'
import { DIFFICULTIES, validDifficulty, type Difficulty } from '../shared/difficulty'
import { GameCore, FLIP_BACK_MS } from '../shared/game'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 3000
const COUNTDOWN_FROM = 3

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

// Serve the built client when it exists (production / docker).
const distDir = path.resolve(__dirname, '../dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')))
}

interface Player {
  id: string // deviceId — stable handle
  name: string
  socketId: string
}

interface Room {
  code: string
  difficulty: Difficulty
  players: Player[]
  game: GameCore | null
  endTime: number
  timer: ReturnType<typeof setTimeout> | null
  countdownTimer: ReturnType<typeof setInterval> | null
  rematchVotes: Set<string>
  over: boolean
}

const rooms = new Map<string, Room>()
const socketRoom = new Map<string, string>()

function genCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  do {
    code = ''
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  } while (rooms.has(code))
  return code
}

function publicPlayers(room: Room) {
  return room.players.map((p) => ({ id: p.id, name: p.name }))
}

function roomUpdate(room: Room) {
  return { code: room.code, difficulty: room.difficulty, players: publicPlayers(room) }
}

function broadcastState(room: Room) {
  if (room.game) io.to(room.code).emit('game:state', room.game.view())
}

function startGame(room: Room) {
  if (room.players.length < 2) return
  if (room.countdownTimer) clearInterval(room.countdownTimer)
  if (room.timer) clearTimeout(room.timer)
  room.over = false
  room.rematchVotes.clear()
  room.game = new GameCore(
    DIFFICULTIES[room.difficulty],
    room.players.map((p) => p.id),
  )

  let n = COUNTDOWN_FROM
  io.to(room.code).emit('game:countdown', { n })
  room.countdownTimer = setInterval(() => {
    n -= 1
    if (n > 0) {
      io.to(room.code).emit('game:countdown', { n })
      return
    }
    if (room.countdownTimer) clearInterval(room.countdownTimer)
    room.countdownTimer = null
    const seconds = DIFFICULTIES[room.difficulty].timer
    room.endTime = Date.now() + seconds * 1000
    io.to(room.code).emit('game:start', {
      cards: room.game!.view().cards,
      endTime: room.endTime,
      difficulty: room.difficulty,
      players: publicPlayers(room),
    })
    broadcastState(room)
    room.timer = setTimeout(() => endGame(room), seconds * 1000)
  }, 1000)
}

function endGame(room: Room) {
  if (room.over) return
  room.over = true
  if (room.timer) {
    clearTimeout(room.timer)
    room.timer = null
  }
  const scores = room.game ? Object.fromEntries(room.game.scores) : {}
  let winner: string | 'tie' = 'tie'
  let best = -Infinity
  let tied = false
  for (const p of room.players) {
    const s = scores[p.id] ?? 0
    if (s > best) {
      best = s
      winner = p.id
      tied = false
    } else if (s === best) {
      tied = true
    }
  }
  io.to(room.code).emit('game:over', {
    scores,
    winner: tied ? 'tie' : winner,
    players: publicPlayers(room),
  })
}

function roomOf(socket: { id: string }): Room | null {
  const code = socketRoom.get(socket.id)
  return code ? rooms.get(code) ?? null : null
}

function leaveRoom(socketId: string) {
  const code = socketRoom.get(socketId)
  socketRoom.delete(socketId)
  if (!code) return
  const room = rooms.get(code)
  if (!room) return
  const wasPlaying = room.game && !room.over
  room.players = room.players.filter((p) => p.socketId !== socketId)

  if (room.players.length === 0) {
    if (room.timer) clearTimeout(room.timer)
    if (room.countdownTimer) clearInterval(room.countdownTimer)
    rooms.delete(code)
    return
  }

  if (wasPlaying) {
    room.over = true
    if (room.timer) clearTimeout(room.timer)
    if (room.countdownTimer) clearInterval(room.countdownTimer)
    room.timer = null
    room.countdownTimer = null
    io.to(code).emit('opponent:left')
  } else {
    io.to(code).emit('room:update', roomUpdate(room))
  }
}

io.on('connection', (socket) => {
  socket.on('room:create', ({ difficulty, name, deviceId }, cb?: (r: unknown) => void) => {
    const code = genCode()
    const room: Room = {
      code,
      difficulty: validDifficulty(difficulty),
      players: [{ id: deviceId, name: String(name || 'Player').slice(0, 24), socketId: socket.id }],
      game: null,
      endTime: 0,
      timer: null,
      countdownTimer: null,
      rematchVotes: new Set(),
      over: false,
    }
    rooms.set(code, room)
    socket.join(code)
    socketRoom.set(socket.id, code)
    cb?.({ code })
    io.to(code).emit('room:update', roomUpdate(room))
  })

  socket.on('room:join', ({ code, name, deviceId }, cb?: (r: unknown) => void) => {
    const key = String(code || '').toUpperCase()
    const room = rooms.get(key)
    if (!room) return cb?.({ error: 'Room not found' })
    const existing = room.players.find((p) => p.id === deviceId)
    if (!existing && room.players.length >= 2) return cb?.({ error: 'Room is full' })

    if (existing) {
      existing.socketId = socket.id
      existing.name = String(name || existing.name).slice(0, 24)
    } else {
      room.players.push({ id: deviceId, name: String(name || 'Player').slice(0, 24), socketId: socket.id })
    }
    socket.join(key)
    socketRoom.set(socket.id, key)
    cb?.({ code: key, difficulty: room.difficulty })
    io.to(key).emit('room:update', roomUpdate(room))
    if (room.players.length === 2 && !room.game) startGame(room)
  })

  socket.on('game:flip', ({ cardId }) => {
    const room = roomOf(socket)
    if (!room || !room.game || room.over) return
    const player = room.players.find((p) => p.socketId === socket.id)
    if (!player) return
    const res = room.game.flip(player.id, Number(cardId))
    if (res.type === 'noop') return
    broadcastState(room)
    if (res.type === 'mismatch') {
      setTimeout(() => {
        if (room.game && !room.over) {
          room.game.clearSelection(res.playerId)
          broadcastState(room)
        }
      }, FLIP_BACK_MS)
    } else if (res.type === 'match' && room.game.isComplete()) {
      endGame(room)
    }
  })

  socket.on('game:rematch', () => {
    const room = roomOf(socket)
    if (!room) return
    const player = room.players.find((p) => p.socketId === socket.id)
    if (!player) return
    room.rematchVotes.add(player.id)
    io.to(room.code).emit('rematch:update', { votes: [...room.rematchVotes] })
    if (room.players.length === 2 && room.rematchVotes.size === 2) startGame(room)
  })

  socket.on('room:leave', () => leaveRoom(socket.id))
  socket.on('disconnect', () => leaveRoom(socket.id))
})

httpServer.listen(PORT, () => {
  console.log(`Matchmoji server listening on :${PORT}`)
})
