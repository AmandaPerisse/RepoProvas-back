import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
let connection;

try {
  connection = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

} catch (error) {
  console.log(error)
}
export { connection };