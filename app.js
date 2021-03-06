// Require
require('dotenv').config();
const bunyan = require('bunyan');
const compression = require('compression');
const express = require("express");
const helmet = require("helmet");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const fileUpload = require('express-fileupload');
const passport = require('passport');
// const MongoStore = require('connect-mongo');
// Set routes
const portfolio = require('./routes/portfolio.js');
const adminPanel = require('./routes/admin_panel');
const adminCategories = require('./routes/admin_categories');
const adminProducts = require('./routes/admin_products');
const adminPortfolio = require('./routes/admin_portfolio');
const users = require('./routes/users');
const cart = require('./routes/cart');
// const pages = require('./routes/pages');
// Get Models
const Category = require('./models/category');

// Connect to db
mongoose.connect(process.env.LOCAL_PORTFOLIO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Initalize app
const app = express();

// Set view engine and static dir
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json())

// Set global error variable

app.locals.errors = null;

// Get all catgories to pass to header.ejs
Category.find((err, categories) => {
    if(err) {
        console.log(err)
    } else {
        app.locals.categories = categories;
    }
});

// Body Parser Middleware
// Parse applicationn/x-www-forn-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Parse application/json
app.use(bodyParser.json());

// // LocalStorage saving objects and arrays
// Storage.prototype.setObj = function(key, obj) {
//         return this.setItem(key, JSON.stringify(obj))
//     }
// Storage.prototype.getObj = function(key) {
//         return JSON.parse(this.getItem(key))
//     }

// Express Session Middleware
app.use(session ({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  // store: new MongoStore({ mongooseConnection: mongoose.connection }),
  // cookie: { maxAge: 180 * 60 * 1000 }
}));

// Helmet Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));

// Compression
app.use(compression());

// Logging
// const loggers = {
//     development: () => bunyan.createLogger({name: "development", level: "debug"}),
//     production: () => bunyan.createLogger({name: "production", level: "info"}),
//     test: () => bunyan.createLogger({name: "test", level: "fatal"}),
// }



// Express fileupload middleware
app.use(fileUpload());

// Initalize Validator
app.use(expressValidator()) 
// Custom Validation Middleware
app.use(expressValidator({
  errorFormatter:function(param,msg,value)
  {
      let namespace=param.split('.'),
      root=namespace.shift(),
      formParam=root;

      while(namespace.length)
      {
          formParam +='['+namespace.shift()+']';
      }
      return{
          param: formParam,
          msg: msg,
          value: value
      };
  },

  customValidators: {
    isImage: function(value, filename) {
        let extension = (path.extname(filename)).toLowerCase();
        switch(extension) {
            case '.jpg':
                return '.jpg';
            case '.jpeg':
                return '.jpeg';
            case '.png':
                return '.png';
            case '':
                return '.jpg';
            default:
                return false;
    }
    }
  },
}));

// Express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.use('*', (req, res, next) => {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
});

// Point to routes
app.use('/', portfolio);
app.use('/admin', adminPanel);
app.use('/admin', adminCategories);
app.use('/admin', adminProducts);
app.use('/admin', adminPortfolio);
app.use('/users', users);
app.use('/cart', cart);
app.get('*', function(req, res) {
   res.redirect('/');
});


// Listen for incoming activity
const port = 3000;
app.listen(port, () => {
  console.log("Server started on port: " + port);
});
