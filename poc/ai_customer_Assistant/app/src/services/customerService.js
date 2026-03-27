const { pool } = require("../db/pool");

async function findCustomerByPhone(phoneNumber) {
  const result = await pool.query(
    "SELECT id, external_customer_id, full_name, phone_number FROM customers WHERE phone_number = $1",
    [phoneNumber]
  );
  return result.rows[0];
}

async function getOrdersByCustomerId(customerId) {
  const result = await pool.query(
    "SELECT order_id, order_status, order_date FROM orders WHERE customer_id = $1 ORDER BY order_date DESC",
    [customerId]
  );
  return result.rows;
}

module.exports = { findCustomerByPhone, getOrdersByCustomerId };
