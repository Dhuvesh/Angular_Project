const { Pool } = require("pg");

const dbConfig = {
  user: "postgres", 
  host: "localhost", 
  database: "fsd",
  password: "Salian3210",
  port: 5432, 
};

const pool = new Pool(dbConfig);

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("PostgreSQL Connected...");
    client.release();
  } catch (err) {
    console.error("Error connecting to PostgreSQL:", err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
