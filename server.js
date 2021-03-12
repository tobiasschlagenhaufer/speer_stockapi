// Mongoose/MongoDB server using Express routing

const mongoose = require("mongoose");
const express = require('express');
const ObjectId = require('mongoose').Types.ObjectId

// Session cookies for the logged in user
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);

// Hashing for security
const argon2 = require('argon2');

// Create the server
const app = express();

// Connect to routes file
const routes = require('./routes');

app.use(routes);

//make a new store to save all our sessions
const store = new MongoDBStore({
  uri: 'mongodb://localhost/stockapi',
  collection: 'sessiondata'
});

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Use the session middleware
app.use(session({ secret: 'SPEER_IS_COOL', cookie: { maxAge: 100000 }, store: store }));


//Connect to database
mongoose.connect('mongodb://localhost/stockapi', {useNewUrlParser: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	app.listen(3000);
	console.log("Server listening on port 3000");
});