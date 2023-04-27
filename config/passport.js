const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
       
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    
    passport.use(
        new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
          // Match user
          User.findOne({
            username: username
          }).then(user => {
            if (!user) {
              return done(null, false, { message: 'Tài khoản chưa được đăng ký!' });
            }
    
            // Match password
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;
              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: 'Mật khẩu không đúng!' });
              }
            });
          });
        })
      );
};
