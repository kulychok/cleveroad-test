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

router.post('/register', async (request, response) => {
	try {
		let { email, password, name, phone } = request.body;

		const chekEmail = /.+@.+\..+/i;
		if (!chekEmail.test(email)) {
			response
				.status(422)
				.json([{ field: email, message: 'Wrong current email' }]);
			return;
		}

		const chekPassword = /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}/g;
		if (!chekPassword.test(password)) {
			response
				.status(422)
				.json([{ field: password, message: 'Wrong current password' }]);
			return;
		}

		const chekPhone = /^(\s*)?(\+)?([- _():=+]?\d[- _():=+]?){10,14}(\s*)?$/;
		if (phone && !chekPhone.test(phone)) {
			response
				.status(422)
				.json([{ field: phone, message: 'Wrong current phone' }]);
			return;
		}

		const token = jwt.sign({ email }, config.jwtSecret, {
			expiresIn: '1d',
		});

		if (!phone) phone = 'Null';
		const query = `INSERT INTO users (email, password, token, phone, name) VALUES("${email}", "${password}", "${token}", "${phone}", "${name}")`;

		connection.query(query, (error) => {
			if (error) {
				response.status(422).json(error);
			} else response.status(200).json({ token: token });
		});
	} catch (error) {
		response.status(500).json({ message: error.message });
	}
});

router.get('/me', async (request, response) => {
	try {
		const headers = request.headers;

		const query = `SELECT \`id\`, \`email\`, \`phone\`, \`name\` FROM \`users\` WHERE \`token\` = "${headers.authorization}"`;
		connection.query(query, (error, result) => {
			if (error) {
				response.status(500).json(error);
			} else if (!result.length) {
				response.status(401).json({});
			} else
				response.status(200).json({
					id: result[0].id,
					email: result[0].email,
					name: result[0].name,
					phone: result[0].phone,
				});
		});
	} catch (error) {
		response.status(500).json({ message: error.message });
	}
});

module.exports = router;
