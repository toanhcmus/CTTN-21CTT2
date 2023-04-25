require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const Book = require('../models/Book');
const { ensureAuthenticatedUser, forwardAuthenticatedUser } = require('../config/auth');

  //GET SIGN-IN PAGE
  router.get('/sign-in', forwardAuthenticatedUser, (req, res) => res.render('sign-in'));

  //GET SIGN-UP PAGE
  router.get('/sign-up', forwardAuthenticatedUser, (req, res) => res.render('sign-up'));

  //SIGN-UP
  router.post('/sign-up', (req, res) => {
    const { fullName, MSSV, pword1, pword2 } = req.body;
    let errors = [];
  
    if (!fullName || !MSSV || !pword1 || !pword2) {
      errors.push({ msg: 'Please enter all fields' });
    }
  
    if (pword1 != pword2) {
      errors.push({ msg: 'Passwords do not match' });
    }
  
    if (pword1.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' });
    }
  
    if (errors.length > 0) {
      res.render('sign-up', {
        errors,
        fullName,
        MSSV,
        pword1,
        pword2
      });
    } else {
      User.findOne({ username: MSSV }).then(user => {
        if (user) {
          errors.push({ msg: 'Username already exists' });
          res.render('sign-up', {
            errors,
            fullName,
            MSSV,
            pword1,
            pword2
          });
        } else {
          const newUser = new User({
            username: MSSV,
            fullName: fullName,
            password: pword1,
            type: "Student"
          });
  
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then(user => {
                  req.flash(
                    'success_msg',
                    'You are now registered and can log in'
                  );
                  res.redirect('/users/sign-in');
                })
                .catch(err => console.log(err));
            });
          });
        }
      });
    }
  });

  //SIGN-IN
  router.post('/sign-in', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/users/dashboard',
      failureRedirect: '/users/sign-in',
      failureFlash: true
    })(req, res, next);
  });
  
  //LOGOUT
  router.get('/log-out', (req, res) => {
    req.logout(function(err) {
      if (!err) {
        req.flash('success_msg', 'You are logged out');
        res.redirect('/users/sign-in');
      }
    });
    
  });

  //ADD BOOK
  router.post('/addBook', ensureAuthenticatedUser, function(req, res) {
    const addedBook = new Book({
      userID: req.user.username,
      title: req.body.title,
      link: req.body.link,
      type: req.body.type,
      category: req.body.cate,
      statusBook: "False"
    });

    Book.create(addedBook)
    .then(function () {
      //console.log("Successfully saved book to DB");
      res.redirect("/users/dashboard");
    })
    .catch(function (err) {
      console.log(err);
    });
  });

  //DASHBOARD
  router.get('/dashboard', ensureAuthenticatedUser, function(req, res) {
    const user = req.user;
    Book.find({userID: user.username})
    .then(function (foundBooks) {
      if (foundBooks.length != 0) {
          res.render("student/dashboard", {foundUser: user, foundBooks: foundBooks});
      }
    })
    .catch(function (err) {
      console.log(err);
    });
  });

  module.exports = router;

