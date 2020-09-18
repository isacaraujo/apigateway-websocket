const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.raw());
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(express.json());

app.post('/events', async (req, res) => {
	console.log(new Date(), '>>> Headers: ', req.headers, ' >>> ', req.body);
	res.status(200)
		.send({connected: true});
});

app.listen(3000, () => {
	console.log('Listen 3000');
});
