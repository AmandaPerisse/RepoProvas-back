async function likesOnPost(postId) {
	return await connection.query('SELECT * FROM likes WHERE "postId"=$1', [postId]);
}

async function likePost(postId, userId) {
	return connection.query('INSERT INTO post FROM likes WHERE "postId"=$1', [postId]);
}

export const userRepository = {
	getUser
}