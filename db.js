require("dotenv").config();
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const isLocal = process.env.DATABASE_URL.includes("localhost");
const sslConfig = isLocal
  ? false
  : { rejectUnauthorized: false }; // Neon requires SSL, disable cert verification



const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // <- Accept Supabase’s cert
  },
});





module.exports = pool;