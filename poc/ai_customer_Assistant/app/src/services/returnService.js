const { pool } = require("../db/pool");

async function getReturnByOrderId(orderId) {
  const result = await pool.query(
    `SELECT o.order_id,
            r.return_status,
            r.eligible,
            r.refund_amount,
            r.metadata
     FROM orders o
     LEFT JOIN return_requests r ON r.order_id = o.id
     WHERE o.order_id = $1`,
    [orderId]
  );
  return result.rows[0];
}

module.exports = { getReturnByOrderId };
