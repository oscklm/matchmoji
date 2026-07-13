# Matchmoji

Paper-craft emoji memory match. Flip tiles on a cutting-mat board, match all 8 pairs before the timer runs out.

Single static file, no build step: fonts, art, and music are all inlined in `index.html`.

## Develop
Open `index.html` directly in a browser, or serve it:
```bash
python3 -m http.server 8000
```

## Deploy
```bash
docker compose up --build   # serves index.html on :3000
```
Point Dokploy at this compose file, same as before.
