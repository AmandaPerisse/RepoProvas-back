import { connection } from '../database.js';

export async function findHashtagsInDescription(description) {
	const descriptionArray = description.split(' ');
	const hashtagsArray = [];

	for (let i = 0; i < descriptionArray.length; i++) {
		if (descriptionArray[i][0] === "#") {
			if (hashtagsArray.includes(descriptionArray[i].replace('#', ''))) { continue };
			hashtagsArray.push(descriptionArray[i].replace('#', ''));
			continue;
		}
	}
	return hashtagsArray;
}

export async function getExistingHashtags(hashtagName) {
	const existingHashtagQuery = await connection.query(`
		SELECT * FROM hashtags
			WHERE name=$1`, [hashtagName]);
	return existingHashtagQuery.rows[0];
}

export async function addOneInExistingHashtagAmount(hashtagId) {
	return await connection.query(`
		UPDATE hashtags
			SET amount = amount + 1
			WHERE id = $1`, [hashtagId]);
}

export async function createNewHashtag(hashtagName, userId) {
	return await connection.query(`
		INSERT INTO hashtags (name, "userId")
			VALUES ($1, $2)`, [hashtagName, userId]);
}

export async function getHashtagData(hashtagName) {
	const hashtagQuery = await connection.query(`
		SELECT * FROM hashtags
			WHERE "name" = $1`, [hashtagName]);
	return hashtagQuery.rows[0];	
}