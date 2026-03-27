const crypto = require("crypto");
const { pool } = require("../db/pool");
const { env } = require("../config/env");

async function createEscalation(callSessionId, reason) {
  const id = crypto.randomUUID();
  const transferTarget = env.humanSupportNumber;
  const transferType = env.defaultTransferType;

  await pool.query(
    `INSERT INTO escalations (id, call_session_id, escalation_reason, escalation_type, transfer_target, transfer_status)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, callSessionId, reason, transferType, transferTarget, "pending"]
  );

  return {
    escalation_id: id,
    transfer_target: transferTarget,
    transfer_type: transferType
  };
}

module.exports = { createEscalation };
