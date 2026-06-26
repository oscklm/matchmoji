import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    // Same-origin connection; Vite proxies /socket.io to the server in dev.
    socket = io({ autoConnect: true })
  }
  return socket
}
