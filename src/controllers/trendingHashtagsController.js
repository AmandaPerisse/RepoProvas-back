import { connection } from '../database.js';

export async function getTrendingHashtags(req, res) {

  const hashtags = await connection.query(`
    SELECT * 
    FROM hashtags 
    ORDER BY amount DESC
    LIMIT 10`);
  res.send(hashtags.rows);
}

