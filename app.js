//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const session = require("express-session");
const passport = require("passport");
const flash = require('connect-flash');

const app = express();

// Passport Config
require('./config/passport')(passport);


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

main().catch(err => console.log(err));

async function main() {
      await mongoose.connect(process.env.DB_URL, {useNewUrlParser: true});
}

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
app.use('/admin', require('./routes/admin.js'));

app.get('*', function(req, res){
  res.render("404");
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
