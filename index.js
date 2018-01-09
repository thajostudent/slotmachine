const express    = require('express');
const mongoose   = require('mongoose');
const helmet     = require('helmet');
const bodyParser = require('body-parser');
const morgan     = require('morgan');
const bluebird   = require('bluebird');

const config = require('./config');
const routes = require('./routes');

require('dotenv').config();

const app  = express();

mongoose.Promise = bluebird;
mongoose.connect(config.mongo.url, { useMongoClient: true });

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('tiny'));

app.use('/', routes); // This is a test

/* app.use(function(error, req, res, next) {
  console.log(error);
  //res.json({ message: error.message });
}); */

const server = app.listen(config.server.port, () => {
  console.log(`Magic happens on port ${config.server.port}`);
});

module.exports = server;
