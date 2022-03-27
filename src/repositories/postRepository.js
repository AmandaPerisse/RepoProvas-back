import { connection } from '../database.js';

export async function findPost(postId, userId) {
	return await connection.query(`
		SELECT * FROM posts
			WHERE id = $1 AND "userId" = $2`, [parseInt(postId), userId]);
}

export async function findUserLikes(userId) {
	return await connection.query({
		text: `SELECT "postId" FROM likes WHERE "userId" = $1`,
		values: [userId],
		rowMode: 'array'
	});
}

// export const postRepository = {
// 	findPost
// }