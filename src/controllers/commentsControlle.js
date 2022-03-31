import { connection } from '../database.js';

export async function postComment(req, res) {
    const { postId, comment } = req.body;
    const { user } = res.locals;

    try {
        const result = await connection.query(`
                    SELECT * FROM posts
                        WHERE id = $1`, [postId]);
        if (result.rowCount === 0)
            return res.sendStatus(404);
        await connection.query(`
            INSERT INTO comments (comment, "postId", "userId")
                VALUES ($1, $2, $3)`, [comment, postId, user.id]);

        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}
export async function getComments(req, res) { }