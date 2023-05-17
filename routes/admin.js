require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const Book = require('../models/Book');
const {ensureAuthenticatedAdmin, forwardAuthenticatedAdmin } = require('../config/auth');

  //GET SIGN-IN PAGE
  router.get('/sign-in', forwardAuthenticatedAdmin, (req, res) => res.render('admin/sign-in'));

  //SIGN-UP
  router.get('/sign-up', (req, res) => {
    const newUser = new User({
      username: "admin",
      fullName: "admin",
      password: process.env.admin_password,
      type: "admin",
      admin: true
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
              'You are now registered and can log in!'
            );
            res.redirect('/admin/sign-in');
          })
          .catch(err => console.log(err));
      });
    });
  });
  
  //Logout admin
  router.get('/log-out', (req, res) => {
    req.logout(function(err) {
      if (!err) {
        req.flash('success_msg', 'You are logged out');
        res.redirect('/admin/sign-in');
      }
    });
  });

  //SIGN-IN
  router.post('/sign-in', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/admin/dashboard',
      failureRedirect: '/admin/sign-in',
      failureFlash: true
    })(req, res, next);
  });
  
  //LOGOUT
  router.get('/log-out', (req, res) => {
    req.logout(function(err) {
      if (!err) {
        req.flash('success_msg', 'You are logged out');
        res.redirect('/admin/sign-in');
      }
    });
    
  });

  //DASHBOARD
  router.get('/dashboard', ensureAuthenticatedAdmin, function(req, res) {
    Book.find({})
    .then(function (foundBooks) {
      if (foundBooks) {
        res.render("admin/dashboard", {foundBooks: foundBooks});
      }
    })
    .catch(function (err) {
      res.redirect("/admin/sign-in");
      console.log(err);
    }); 
  });

  //DASHBOARD-USERS-BOOKS
  router.get('/dashboard-users', ensureAuthenticatedAdmin, function(req, res) {
    User.find({})
    .then(function (foundUsers) {
      if (foundUsers) 
        res.render("admin/dashboard-users", {foundUsers: foundUsers});
      })
    .catch(function (err) {
      res.redirect("/admin/sign-in");
      console.log(err);
    }); 
  });

  //VERIFY BOOK
  router.post('/verifyBook/:id', ensureAuthenticatedAdmin, function(req, res) {
    const id = req.params.id;
    console.log("/verifyBook/" + id);

    Book.findById(id)
    .then(function (foundBook) {
      foundBook.statusBook = 'True';
      foundBook.save();
      res.redirect("/admin/dashboard");
    })
    .catch(function (err) {
      console.log(err);
    });
  });

//DELETE BOOK
router.post('/deleteBook/:id', ensureAuthenticatedAdmin, function(req, res) {
  const id = req.params.id;
  Book.findByIdAndRemove(id)
  .then(function () {
    //console.log("Successfully deleted book");
    res.redirect("/admin/dashboard");
  })
  .catch(function (err) {
    console.log(err);
  });
});
  module.exports = router;

