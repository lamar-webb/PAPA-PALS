import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

dotenv.config();

const pool = new Pool({
  user: "aqogcafe",
  host: "mahmud.db.elephantsql.com",
  database: "aqogcafe",
  password: process.env.DB_PASSWORD,
  port: 5432,
});

export const queryDB = async (query, values) => {
  const client = await pool.connect();
  try {
    const res = await client.query(query, values);
    return res.rows;
  } finally {
    client.release();
  }
};

if (queryDB) {
  console.log("Database connected successfully");
} else console.log("Database connection failed");
