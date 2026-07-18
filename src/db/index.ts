import { Pool } from "pg";
import config from "../config";

//DB Connection
export const pool = new Pool({
  connectionString: config.connection_string,
});


// Create Table
export const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(20),
      email VARCHAR(20) UNIQUE NOT NULL,
      password VARCHAR(20) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      age INT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
      `);
    console.log("Database Connected Successfully!");
  } catch (error) {
    console.log(error);
  }
};