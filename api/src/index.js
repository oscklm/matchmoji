// MatchMoji leaderboard API — three JSON endpoints over D1.
// Times are client-reported and only sanity-checked; this is a casual game.

const MODES = new Set(["easy", "hard", "boomer"]);
const MIN_TIME_MS = 2000;
const MAX_TIME_MS = 60000; // matches the client's 60s round cap
const TOP_N = 50;
const NAME_RE = /^[A-Za-z0-9_.-]{3,16}$/;
const NAME_BLOCKLIST = ["fuck", "shit", "cunt", "nigg", "fag", "hitler", "rape"];
const ID_RE = /^[A-Za-z0-9-]{8,64}$/;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Max-Age": "86400",
};

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...CORS_HEADERS },
  });
}

async function sha256(str) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return new Uint8Array(digest);
}

async function secretMatches(secret, storedHexHash) {
  const a = await sha256(secret);
  const b = Uint8Array.from(storedHexHash.match(/../g) ?? [], (h) => parseInt(h, 16));
  if (a.byteLength !== b.byteLength) return false;
  return crypto.subtle.timingSafeEqual(a, b);
}

async function sha256Hex(str) {
  return [...(await sha256(str))].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function validName(name) {
  if (typeof name !== "string" || !NAME_RE.test(name)) return false;
  const lower = name.toLowerCase();
  return !NAME_BLOCKLIST.some((w) => lower.includes(w));
}

function validCredentials(body) {
  return (
    typeof body.playerId === "string" && ID_RE.test(body.playerId) &&
    typeof body.secret === "string" && body.secret.length >= 8 && body.secret.length <= 128
  );
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function rankFor(db, mode, timeMs, achievedAt) {
  const row = await db
    .prepare(
      "SELECT COUNT(*) + 1 AS rank FROM scores WHERE mode = ?1 AND (time_ms < ?2 OR (time_ms = ?2 AND achieved_at < ?3))"
    )
    .bind(mode, timeMs, achievedAt)
    .first();
  return row.rank;
}

async function handleClaimName(request, env) {
  const body = await readJson(request);
  if (!body || !validCredentials(body)) return json(400, { error: "invalid_request" });
  if (!validName(body.name)) return json(400, { error: "invalid_name" });

  const now = Date.now();
  const hash = await sha256Hex(body.secret);
  const existing = await env.DB.prepare("SELECT secret_hash FROM players WHERE id = ?1")
    .bind(body.playerId)
    .first();

  try {
    if (existing) {
      if (!(await secretMatches(body.secret, existing.secret_hash))) {
        return json(403, { error: "forbidden" });
      }
      await env.DB.prepare("UPDATE players SET name = ?1, last_seen_at = ?2 WHERE id = ?3")
        .bind(body.name, now, body.playerId)
        .run();
    } else {
      await env.DB.prepare(
        "INSERT INTO players (id, secret_hash, name, created_at, last_seen_at) VALUES (?1, ?2, ?3, ?4, ?4)"
      )
        .bind(body.playerId, hash, body.name, now)
        .run();
    }
  } catch (err) {
    if (String(err).includes("UNIQUE constraint failed")) return json(409, { error: "name_taken" });
    throw err;
  }
  return json(200, { player: { id: body.playerId, name: body.name } });
}

async function handleSubmitScore(request, env) {
  const body = await readJson(request);
  if (!body || !validCredentials(body)) return json(400, { error: "invalid_request" });

  if (!MODES.has(body.mode)) return json(400, { error: "invalid_mode" });
  if (!Number.isInteger(body.timeMs) || body.timeMs < MIN_TIME_MS || body.timeMs > MAX_TIME_MS) {
    return json(400, { error: "invalid_time" });
  }

  const player = await env.DB.prepare("SELECT secret_hash FROM players WHERE id = ?1")
    .bind(body.playerId)
    .first();
  if (!player || !(await secretMatches(body.secret, player.secret_hash))) {
    return json(403, { error: "unknown_player" });
  }

  const now = Date.now();
  const existing = await env.DB.prepare(
    "SELECT time_ms, achieved_at FROM scores WHERE player_id = ?1 AND mode = ?2"
  )
    .bind(body.playerId, body.mode)
    .first();
  const personalBest = !existing || body.timeMs < existing.time_ms;

  // every clear counts as a play; the stored time only improves
  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO scores (player_id, mode, time_ms, achieved_at, plays) VALUES (?1, ?2, ?3, ?4, 1) " +
        "ON CONFLICT (player_id, mode) DO UPDATE SET " +
        "plays = scores.plays + 1, " +
        "time_ms = CASE WHEN excluded.time_ms < scores.time_ms THEN excluded.time_ms ELSE scores.time_ms END, " +
        "achieved_at = CASE WHEN excluded.time_ms < scores.time_ms THEN excluded.achieved_at ELSE scores.achieved_at END"
    ).bind(body.playerId, body.mode, body.timeMs, now),
    env.DB.prepare("UPDATE players SET last_seen_at = ?1 WHERE id = ?2").bind(now, body.playerId),
  ]);

  const bestTimeMs = personalBest ? body.timeMs : existing.time_ms;
  const bestAt = personalBest ? now : existing.achieved_at;
  const [rank, totalRow] = await Promise.all([
    rankFor(env.DB, body.mode, bestTimeMs, bestAt),
    env.DB.prepare("SELECT COUNT(*) AS total FROM scores WHERE mode = ?1").bind(body.mode).first(),
  ]);

  return json(200, { personalBest, bestTimeMs, rank, total: totalRow.total });
}

async function handleLeaderboard(url, env) {
  const mode = url.searchParams.get("mode");
  if (!MODES.has(mode)) return json(400, { error: "invalid_mode" });
  const playerId = url.searchParams.get("player");

  const [top, totalRow] = await Promise.all([
    env.DB.prepare(
      "SELECT s.player_id, p.name, s.time_ms, s.plays FROM scores s JOIN players p ON p.id = s.player_id " +
        "WHERE s.mode = ?1 ORDER BY s.time_ms ASC, s.achieved_at ASC LIMIT ?2"
    )
      .bind(mode, TOP_N)
      .all(),
    env.DB.prepare("SELECT COUNT(*) AS total FROM scores WHERE mode = ?1").bind(mode).first(),
  ]);

  const entries = top.results.map((row, i) => ({
    rank: i + 1,
    name: row.name,
    timeMs: row.time_ms,
    plays: row.plays,
    isYou: playerId != null && row.player_id === playerId,
  }));

  let you = null;
  if (playerId) {
    const own = await env.DB.prepare(
      "SELECT s.time_ms, s.achieved_at, s.plays, p.name FROM scores s JOIN players p ON p.id = s.player_id " +
        "WHERE s.player_id = ?1 AND s.mode = ?2"
    )
      .bind(playerId, mode)
      .first();
    if (own) {
      you = {
        rank: await rankFor(env.DB, mode, own.time_ms, own.achieved_at),
        name: own.name,
        timeMs: own.time_ms,
        plays: own.plays,
      };
    }
  }

  return json(200, { mode, total: totalRow.total, entries, you });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
    const url = new URL(request.url);
    try {
      if (request.method === "POST" && url.pathname === "/v1/players") return await handleClaimName(request, env);
      if (request.method === "POST" && url.pathname === "/v1/scores") return await handleSubmitScore(request, env);
      if (request.method === "GET" && url.pathname === "/v1/leaderboard") return await handleLeaderboard(url, env);
      return json(404, { error: "not_found" });
    } catch (err) {
      console.error(JSON.stringify({ msg: "unhandled_error", path: url.pathname, error: String(err) }));
      return json(500, { error: "internal" });
    }
  },
};
