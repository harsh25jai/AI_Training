const crypto = require("crypto");
const { pool } = require("../db/pool");

async function getOrCreateSession(retellCallId, callerPhoneNumber) {
  const existing = await pool.query(
    "SELECT id, retell_call_id FROM call_sessions WHERE retell_call_id = $1",
    [retellCallId]
  );

  if (existing.rows[0]) {
    return existing.rows[0];
  }

  const id = crypto.randomUUID();
  const created = await pool.query(
    `INSERT INTO call_sessions (id, retell_call_id, caller_phone_number, call_status, started_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, retell_call_id`,
    [id, retellCallId, callerPhoneNumber, "ongoing"]
  );

  return created.rows[0];
}

async function addCallEvent(callSessionId, eventType, payload) {
  const id = crypto.randomUUID();
  await pool.query(
    `INSERT INTO call_events (id, call_session_id, event_type, payload)
     VALUES ($1, $2, $3, $4)`,
    [id, callSessionId, eventType, payload]
  );
}

module.exports = { getOrCreateSession, addCallEvent };
