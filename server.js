require('dotenv').config({silent: true});
const express = require('express');
const logger = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const Client = require('mariasql');
const trackerNames = ['redacted', 'apollo', 'what'];

const sort = (values) => {
  let length = values.length;
  for(var i = 1; i < length; ++i) {
    let temp = values[i];
    let j = i - 1;
    for(; j >= 0 && values[j].timestamp > temp.timestamp; --j) {
      values[j+1] = values[j];
    }
    values[j+1] = temp;
  }
  return values;
};

const queryDB = (req, response, next) => {
	response.data = {};
	let c = new Client({
	  host: process.env.DB_HOST,
	  user: process.env.DB_USER,
	  password: process.env.DB_PASS,
	  db: process.env.DB_NAME,
	  port: process.env.DB_NAME
	});
	// console.log(process.env.HOST, process.env.DB_USER, process.env.PASSWORD, process.env.DB, process.env.DB_PORT);
	for(let i = 0; i < trackerNames.length; i++){
		response.data[trackerNames[i]] = [];
		if(trackerNames[i] !== 'what') {
			let query = c.query(`SELECT * FROM stats WHERE tracker = '${trackerNames[i]}'`);
			query.on('result', function(res) {
	  		res.on('data', function(row) {
	  		// setRow(row);
	  			response.data[trackerNames[i]].push(row);
	    	// console.dir(row);
		  	}).on('end', function() {
		    	response.data[trackerNames[i]] = sort(response.data[trackerNames[i]])
		  	});
			}).on('end', function() {
		  	 	i+1 < trackerNames.length ? null : next();
			});
		}
		// Differentiate what.cd from other tracker operations, since its columns differ.
		else {
			let query = c.query(`SELECT * FROM what`);
			query.on('result', function(res) {
				res.on('data', function(row) {
				// setRow(row);
					response.data['what'].push(row);
					console.dir(response.data['what']);
			// console.dir(row);
		  	}).on('end', function() {
		    	console.log('Result set finished');
		  	});
			}).on('end', function() {
			  	console.log('No more result sets!');
			  	next();
			});

		}
	}
	console.log('done');

	// c.query('SELECT * FROM apollo',
	//         function(err, rows) {
	//   if (err)
	//     throw err;
	//   res.apollo = rows;
	// });

 	c.end();
 	// console.dir(response.redacted);
}
// const userRoute = require('./routes/user')
// const flagRoute = require('./routes/flag')
// const placeRoute = require('./services/googleMaps');

const app = express();
const port = process.argv[2] || process.env.PORT || 3000;

app.use(logger('dev'));

app.use(bodyParser.json());
// app.use('/user', userRoute);
// app.use('/place', placeRoute);
// app.use('/flag', flagRoute);

// const history = require('connect-history-api-fallback');
// app.use(history());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/trackers', queryDB, (req, res) => {
	console.dir(res.data);
	res.json(res.data);
})

app.get('/', (req, res) => {
	res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
	// res.json(res.data || 'Hello');
})

// app.use(express.static(path.join(__dirname, 'dist')));

// app.get('*', function (req, res){
//   res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
// })

app.listen(port, () => console.log('Server is listening on', port));

