const express = require('express');
const router = require('./routes');
const config = require('./config.json');

const app = express();

const PORT = config.port;

app.use(express.json({ extended: true }));

app.use('/api', router);

app.listen(PORT, () => console.log(`App has been startred on port ${PORT}...`));
