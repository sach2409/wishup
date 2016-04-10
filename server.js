var express = require("express")
var app = express();
var port = process.env.PORT || 8080
var mongoose = require("mongoose")
var passport = require("passport")
var flash = require("connect-flash")
var morgan = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var session = require('express-session')
var configDB = require('./config/database.js')

mongoose.connect(configDB.url); //connect to database
require('./config/passport')(passport); //pass passport for config
app.use(morgan('dev'));	 //log console requests
app.use(cookieParser()); //read cookies
app.use(bodyParser());	 //get info from html forms

app.set('view engine','ejs');

app.use(session({secret: 'waitingforthewindsofwinter'})); //session secret is "waiting for the winds of winter" (w/o white spaces)
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./app/routes.js')(app,passport,mongoose);
app.listen(port);

console.log('The connection happen on port: '+port);