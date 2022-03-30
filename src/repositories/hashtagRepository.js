import { connection } from '../database.js';

export async function findHashtagsInDescription(description) {
	const descriptionArray = description.split(' ');
	const hashtagsArray = [];

    function isHashtagRepeated(hashtagName) {
        return hashtagsArray.includes(hashtagName.replace('#', ''));
    }

	for (let i = 0; i < descriptionArray.length; i++) {
		if (descriptionArray[i][0] === "#") {
			if (isHashtagRepeated(descriptionArray[i])) { continue };

            const hashtagName = descriptionArray[i].replace('#', '');
			if (hashtagName.length === 0 || hashtagName.includes('#')) { continue };

			hashtagsArray.push(hashtagName);
			continue;
		}
	}
	return hashtagsArray;
}

export async function addOneInExistingHashtagAmount(hashtagId) {
	return await connection.query(`
		UPDATE hashtags
			SET amount = amount + 1
			WHERE id = $1`, [hashtagId]);
}

export async function createNewHashtag(hashtagName, creatorId) {
	return await connection.query(`
		INSERT INTO hashtags (name, "userId")
			VALUES ($1, $2)`, [hashtagName, creatorId]);
}

export async function getHashtagData(hashtagName, limit) {
	const hashtagQuery = await connection.query(`
		SELECT * FROM hashtags
			WHERE "name" = $1`, [hashtagName]);
	return hashtagQuery.rows[0];
}

export async function getLastsHashtags(limit) {
	const lastHashtagsQuery = await connection.query(`
    	SELECT * 
    		FROM hashtags 
    		ORDER BY amount DESC
    		LIMIT $1`, [limit]);

    return lastHashtagsQuery.rows;
}