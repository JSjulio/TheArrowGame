const { Pool } = require("pg");
const db = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://localhost:5432/34a-classroom_manager",
});

async function query(sql, params, callback) {
  return db.query(sql, params, callback);
}

module.exports = { query };
