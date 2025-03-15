const { Pool } = require("pg");

const dbConfig = {
  user: "root", // PostgreSQL username
  host: "localhost", // Hostname for the PostgreSQL server
  database: "my_database", // Your PostgreSQL database name
  password: "root", // PostgreSQL password
  port: 5432, // Default PostgreSQL port
};

const pool = new Pool(dbConfig);

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("PostgreSQL Connected...");
    client.release(); // Release the client back to the pool
  } catch (err) {
    console.error("Error connecting to PostgreSQL:", err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
