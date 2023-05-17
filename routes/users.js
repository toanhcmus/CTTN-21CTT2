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
      errors.push({ msg: 'Vui lòng nhập đầy đủ các trường!' });
    }
  
    if (pword1 != pword2) {
      errors.push({ msg: 'Mật khẩu không khớp!' });
    }
  
    if (pword1.length < 8) {
      errors.push({ msg: 'Mật khẩu phải có ít nhất 8 ký tự!' });
    }

    if (MSSV.length != 8) {
      errors.push({ msg: 'Mã số sinh viên phải có 8 ký tự!' });
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
          errors.push({ msg: 'Tài khoản đã tồn tại' });
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
                    'Bạn đã đăng ký và có thể đăng nhập'
                  );
                  res.redirect('/users/sign-in');
                })
                .catch(err => res.status(400).send(err));
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
        //req.flash('success_msg', 'You are logged out');
        res.redirect('/');
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

    const id = req.user._id;

    User.findById(id)
    .then(function (foundUser) {
      foundUser.books++;
      foundUser.save();
    })
    .catch(function (err) {
      console.log(err);
    });

    Book.create(addedBook)
    .then(function () {
      //console.log("Successfully saved book to DB");
      res.redirect("/users/dashboard");
    })
    .catch(function (err) {
      res.status(400).send(err);
    });
  });

  //DASHBOARD
  router.get('/dashboard', ensureAuthenticatedUser, (req, res) => {
    const user = req.user;
    //console.log(user);
    Book.find({userID: user.username})
    .then(function (foundBooks) {
          res.render("student/dashboard", {foundUser: user, foundBooks: foundBooks});
    })
    .catch(function (err) {
      res.status(400).send(err);
    });
  });

  module.exports = router;

