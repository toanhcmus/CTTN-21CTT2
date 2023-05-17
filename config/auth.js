module.exports = {
    ensureAuthenticatedUser: function(req, res, next) {
      console.log(req.user);
      if (req.user === undefined)
      {
          req.flash('error_msg', 'Vui lòng đăng nhập!');
          res.redirect('/users/sign-in');
      } else 
      {
        const checkAdmin = req.user.admin;
        if (req.isAuthenticated()) {
          if (checkAdmin === false) {
              return next();
          }
        }
        req.flash('error_msg', 'Vui lòng đăng nhập!');
        res.redirect('/users/sign-in');
      }
      
    },
    forwardAuthenticatedUser: function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      if (req.user.admin === true) {
        res.render('admin/dashboard');
      } else {
        res.render('student/dashboard'); 
      }
    },
    forwardAuthenticatedAdmin: function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      if (req.user.admin === true)
      {
        res.render('admin/dashboard');
      } else {
        req.flash('error_msg', 'Bạn không phải là admin!');
        res.redirect('/users/log-out'); 
      }
    },
    ensureAuthenticatedAdmin: function(req, res, next) {
      const checkAdmin = req.user.admin;

      if (req.isAuthenticated()) {
        if (checkAdmin === true) {
            return next();
        }
      }
      req.flash('error_msg', 'Bạn không phải là admin!');
      res.redirect('/admin/sign-in');
    }
  };