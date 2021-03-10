const express = require('express');
const connection = require('./dbConnection');
const jwt = require('jsonwebtoken');
const e = require('express');
const config = require('./config.json');

const router = express.Router();

router.post('/login', async (request, response) => {
	try {
		const { email, password } = request.body;

		const query = `SELECT \`id\`, \`email\`, \`password\` FROM \`users\` WHERE \`email\` = "${email}"`;

		connection.query(query, (error, result) => {
			if (error) {
				response.json(error);
				response.status(500).json({ message: error.message });
			}

			if (!result.length) {
				response.status(422).json([
					{
						field: 'email',
						message: 'Wrong email or password',
					},
				]);
			} else if (result[0].password !== password) {
				response.status(422).json([
					{
						field: 'password',
						message: 'Wrong email or password',
					},
				]);
			} else {
				const token = jwt.sign(
					{ userId: result[0].id },
					config.jwtSecret,
					{
						expiresIn: '1d',
					}
				);
				const query = `UPDATE users SET token="${token}"`;
				connection.query(query, () => {
					response.status(200).json({ token: token });
				});
			}
		});
	} catch (error) {
		response.status(500).json({ message: error.message });
	}
});

module.exports = router;
