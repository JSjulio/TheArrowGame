const { Pool } = require("pg");
const db = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://jsjulio:@localhost:5432/theArrowGame",
  ssl: false, // turn off secure socket layer to allow postico / psql to access db info 
});

async function query(sql, params, callback) {
  return db.query(sql, params, callback);
}

module.exports = { query };
