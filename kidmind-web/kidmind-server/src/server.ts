import dotenv from "dotenv";
import app from "./app";
import pool from "./database/db";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    const connection = await pool.getConnection();

    console.log("Connected to MySQL");

    connection.release();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Database connection failed");
    console.error(error);
  }
}

startServer();