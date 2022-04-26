require('dotenv').config();

exports.isUser = function(req, res, next) {
  if(req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', 'Please log in.');
    res.redirect('/users/login');
  }
}

exports.isAdmin = function(req, res, next) {
  if(req.isAuthenticated() && res.locals.user.admin == process.env.ADMIN_NUM) {
    next();
  } else {
    req.flash('danger', 'Please log in as admin.');
    res.redirect('/users/login');
  }
}