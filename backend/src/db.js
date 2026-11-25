import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (error) => {
  console.error("Error en una conexión inactiva de la base:", error.message);
});

export default pool;
