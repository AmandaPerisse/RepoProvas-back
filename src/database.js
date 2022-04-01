import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
let connection;

try {
  connection = new Pool({
    connectionString: "postgres://postgres:12345@localhost:5432/linkr",
    ssl: {
      rejectUnauthorized: false
    }
  });

} catch (error) {
  console.log(error)
}

export { connection };