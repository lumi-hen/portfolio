const express=require('express');
const router=express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { rawListeners } = require('../models/user');


// // Get register
// router.get('/register', isAdmin, (req,res,next) =>{
//     res.render('register', {
//         title: 'Register',
//     });
// });

// // POST register
// router.post('/register', (req,res,next) =>{
//     let name = req.body.name;
//     let email = req.body.email;
//     let username = req.body.username;
//     let password = req.body.password;
//     let password2 = req.body.password2;


//     req.checkBody('name', 'Name is required!').notEmpty();
//     req.checkBody('email', 'Email is required!').notEmpty();
//     req.checkBody('username', 'Username is required!').notEmpty();
//     req.checkBody('password', 'Password is required!').notEmpty();
//     req.checkBody('password2', 'Passwords do not match').equals(password);

//     let errors = req.validationErrors();

//     if(errors) {
//         res.render('register', {
//             errors: errors,
//             user: null,
//             title: 'Register',
//         });
//     } else {
//         User.findOne({username: username}, function(err, user) {
//             if(err) console.log(err);
//             if(user) {
//               req.flash('danger', 'Username exists, choose another!');
//               res.redirect('/users/register');
//             } else {
//                 let user = new User({
//                     name: name,
//                     email,
//                     username,
//                     password,
//                     admin: 0
//                 });
//                 bcrypt.genSalt(10, function(err, salt) {
//                     bcrypt.hash(user.password, salt, function(err, hash) {
//                         if(err) console.log(err);

//                         user.password = hash;
                        
//                         user.save(function(err) {
//                             if(err) {
//                                 console.log(err)
//                             } else {
//                                 req.flash('success', 'You are now registered!');
//                                 res.redirect('/users/login');
//                             }
//                         });
//                     });
//                 });
//             }
//         });
//     }
// });

// Get login
router.get('/login',(req,res,next) =>{


	if(req.isAuthenticated()) {
		res.redirect("/");
	} else {
		res.render('login', {
        title: 'Login',
    });

	}
});

// Post login
router.post('/login',(req,res,next) =>{
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Get logout
router.get('/logout',(req,res,next) =>{
    req.logOut();

    req.flash('success', 'You are logged out!');
    res.redirect('/users/login');
});

module.exports=router;
