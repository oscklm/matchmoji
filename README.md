# Matchmoji

Multiplayer emoji memory-match game. Flip cards, match smileys, outscore your rival before the clock runs out.

- **Singleplayer** — clear the board before time runs out; combos boost your score.
- **Multiplayer** — create a room, share the 4-char code; both players race on one **shared** board in real time. Most points when time runs out wins.
- **Difficulty** — Easy / Hard / Hardcore scale up emoji similarity, board size, and shrink the timer.

## Stack
Vite + React + TailwindCSS (client) · Node + Express + Socket.IO (server) · in-memory rooms, no DB. Game logic in `shared/` is reused by the singleplayer client engine and the authoritative multiplayer server.

## Develop
```bash
npm install
npm run dev      # vite (5173) + socket server (3000), proxied
```
Open http://localhost:5173. For two-player testing, open a second tab/incognito window.

## Production / Docker
```bash
docker compose up --build   # serves the built client + websockets on :3000
```
Point Dokploy at this compose file. The server serves the built client and Socket.IO on the same port — no CORS, no extra service.

## Scaling note
One Node process handles thousands of concurrent players for this workload. State is in-memory (single instance). To scale horizontally later: add `@socket.io/redis-adapter` and move room state to Redis. The wire protocol is client-agnostic, so the backend is swappable (e.g. Rust `socketioxide`) with no client changes.
