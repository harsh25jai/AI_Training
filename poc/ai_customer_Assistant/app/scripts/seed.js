const fs = require("fs");
const path = require("path");
const { pool } = require("../src/db/pool");

async function runSeed() {
  const seedPath = path.join(__dirname, "..", "..", "db", "seed.sql");
  const sql = fs.readFileSync(seedPath, "utf8");

  try {
    await pool.query(sql);
    console.log("Seed data inserted");
  } catch (error) {
    console.error("Seed failed", error.message);
  } finally {
    await pool.end();
  }
}

runSeed();
