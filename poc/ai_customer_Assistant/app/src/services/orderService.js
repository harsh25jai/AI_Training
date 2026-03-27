const { pool } = require("../db/pool");

async function getOrderWithShipment(orderId) {
  const result = await pool.query(
    `SELECT o.id AS order_uuid,
            o.order_id,
            o.order_status,
            o.order_date,
            o.return_eligible,
            s.shipment_status,
            s.tracking_number,
            s.expected_delivery_date,
            s.last_tracking_update_at,
            s.tracking_payload
     FROM orders o
     LEFT JOIN shipments s ON s.order_id = o.id
     WHERE o.order_id = $1`,
    [orderId]
  );
  return result.rows[0];
}

module.exports = { getOrderWithShipment };
