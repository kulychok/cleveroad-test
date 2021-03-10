const mysql = require('mysql2');
const config = require('./config.json');

connection = mysql.createConnection({
	host: config.dbInfo.host,
	user: config.dbInfo.user,
	database: config.dbInfo.database,
	password: config.dbInfo.password,
});

connection.connect((err) => {
	if (err) {
		return console.error('Error: ' + err.message);
	} else {
		console.log('MySQL successfully connected');
	}
});

module.exports = connection;
