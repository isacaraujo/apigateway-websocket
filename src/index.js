const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const AWS = require('aws-sdk');

const wsDomainName = process.env.WEBSOCKET_ENDPOINT.replace('wss://', '');

const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
	apiVersion: '2018-11-29',
	endpoint:  + `${wsDomainName}/Prod`,
});

const app = express();

app.use(bodyParser.raw());
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.get('/', (req, res) => {
	res.render('index', {
		websocketUri: `${process.env.WEBSOCKET_ENDPOINT}/Prod`
	});
});

const connections = [];

app.post('/connected', async (req, res) => {
	console.log('POST /connected');
	console.log(new Date(), '>>> Headers: ', req.headers, ' >>> ', req.body);

	const { connectionid } = req.headers;
	connections.push(connectionid);
	res.status(200)
		.send({connected: true});
});

app.post('/disconnected', async (req, res) => {
	console.log('POST /disconnected');
	console.log(new Date(), '>>> Headers: ', req.headers, ' >>> ', req.body);

	const { connectionid } = req.headers;
	const index = connections.indexOf(connectionid);
	if (index > -1) {
		connections.splice(index, 1);
		console.log('removed from conections');
	}

	res.status(200)
		.send({disconnected: true});
});

app.post('/sendmessage', async (req, res) => {
	console.log('POST /sendmessage');
	console.log(new Date(), '>>> Headers: ', req.headers, ' >>> ', req.body);

	const { connectionid } = req.headers;

	const payload = Buffer.from(req.body.data, 'utf8');

	const promises = connections
		.filter((conn) => conn !== connectionid)
		.map((conn => {
			return new Promise((resolve) => {
				apigatewaymanagementapi.postToConnection({
					ConnectionId: conn,
					Data: payload,
				}, (err, ret) => {
					if (err) {
						console.error(err);
						resolve();
						return;
					}
					console.info(ret);
					resolve();
				});
			});
		}));

	if (promises.length > 0) {
		await Promise.all(promises);
	}

	res.status(200)
		.send({sendmessage: true});
});

app.listen(3000, () => {
	console.log('Listen 3000');
});
