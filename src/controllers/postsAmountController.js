import { connection } from '../database.js';

export async function getPostsAmount(req, res) {
    try {
        const getUserQuery = await connection.query(`
            SELECT COUNT(id) as "postsAmount" FROM posts;
        `); 
        res.send(getUserQuery.rows);

    } catch (error) {
        res.status(500).send('getPostsAmount error');
    }
}
