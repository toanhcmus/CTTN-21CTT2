  require('dotenv').config();
  const express = require('express');
  const router = express.Router();
  const bcrypt = require('bcryptjs');
  const passport = require('passport');
  const User = require('../models/User');
  const Book = require('../models/Book');
  const nodeMailer = require('nodemailer');
  const {ensureAuthenticatedAdmin, forwardAuthenticatedAdmin } = require('../config/auth');

  const transporter = nodeMailer.createTransport({
    service: "hotmail",
    auth: {
      user: "cttn-21ctt2@outlook.com",
      pass: process.env.EMAIL_PW
    }
  });

  let options = {
    from: "cttn-21ctt2@outlook.com",
    to: "",
    subject: "",
    html: ""
  };


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
          .catch(err => res.render("400"));
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

  let user = "";

  //VERIFY BOOK
  router.post('/verifyBook/:id', ensureAuthenticatedAdmin, function(req, res) {
      const id = req.params.id;
      console.log("/verifyBook/" + id);

      Book.findById(id)
      .then(function (foundBook) {
        user = foundBook.userID;
        //console.log("id: "+ user);

        foundBook.statusBook = 'True';
        foundBook.save();
        options.to = foundBook.userID + "@student.hcmus.edu.vn";
        options.subject = "[CTTN-21CTT2] - XÁC NHẬN TÀI LIỆU CỦA BẠN ĐÃ ĐƯỢC DUYỆT";
        let content = `
        <h1>TÀI LIỆU CỦA BẠN ĐÃ ĐƯỢC DUYỆT</h1>
        <ul>
        <li><strong>Tên tài liệu: </strong> ${foundBook.title}</li>
        <li><strong>Liên kết:</strong> <a href=${foundBook.link} target="_blank">tài liệu</a></li>
        </ul>
        
        <strong>CẢM ƠN BẠN ĐÃ ĐÓNG GÓP TÀI LIỆU ĐỂ CÔNG TRÌNH THANH NIÊN ĐƯỢC THÀNH CÔNG!</strong>
        `
        options.html = content;

        transporter.sendMail(options, (err, info) => {
          if (err) {
            //console.log(err);
          } else {
            //console("Sent: " + info.response);
          }
        })

        User.findOne({username: user})
        .then(function (foundUser) {
          //console.log(foundUser);
          foundUser.books++;
          foundUser.save();
          res.redirect("/admin/dashboard");
        })
      })
      .catch(function (err) {
        res.render("400");
      });
  });

//DELETE BOOK
router.post('/deleteBook/:id', ensureAuthenticatedAdmin, function(req, res) {
  const id = req.params.id;
  Book.findByIdAndRemove(id)
  .then(function (foundBook) {
    //console.log("Successfully deleted book");
        //console.log(foundBook);
        options.to = foundBook.userID + "@student.hcmus.edu.vn";
        options.subject = "[CTTN-21CTT2] - XÁC NHẬN TÀI LIỆU CỦA BẠN KHÔNG ĐƯỢC DUYỆT";
        let content = `
        <h1>TÀI LIỆU CỦA BẠN KHÔNG ĐƯỢC DUYỆT</h1>
        <ul>
        <li><strong>Tên tài liệu: </strong> ${foundBook.title}</li>
        <li><strong>Liên kết:</strong> <a href=${foundBook.link} target="_blank">tài liệu</a></li>
        </ul>
        <p>Tài liệu không được duyệt có thể vì: 
        <ul>
          <li>Tài liệu trong link và tên tài liệu không đúng.</li>
          <li>Liên kết yêu cầu quyền truy cập.</li>
          <li>Liên kết bị hỏng.</li>
          <li>Và nhiều vấn đề khác.</li>
        </ul>
        </p>
        <strong>BẠN UPLOAD LẠI TÀI LIỆU MỚI GIÚP MÌNH NHÉ! CẢM ƠN BẠN ĐÃ ĐÓNG GÓP TÀI LIỆU ĐỂ CÔNG TRÌNH THANH NIÊN ĐƯỢC THÀNH CÔNG!</strong>
        `
        options.html = content;

        transporter.sendMail(options, (err, info) => {
          if (err) {
            //console.log(err);
          } else {
            //console("Sent: " + info.response);
          }
        })
    res.redirect("/admin/dashboard");
  })
  .catch(function (err) {
    res.render("400");
  });
});
  module.exports = router;

