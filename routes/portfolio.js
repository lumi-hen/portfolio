const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const nodemailer = require('nodemailer');
const Portfolio = require('../models/portfolio');
const mongoose = require("mongoose");
const db = mongoose.connection;
require('dotenv').config();


// Get all products
router.get('/', (req, res) => {  
  db.collection("products")
  .find()
  .toArray((err, products) => {
    if (err) {
      console.log(err);
    } else {
      // In the callback of the first query, so it will
      // execute 2nd query, only when the first one is done
      db.collection("portfolios")
        .find()
        .toArray((err, items) => {
          if (err) {
            console.log(err);
          } else {
            // In the callback of the 2nd query, send the response
            // here since both data are at hand
            res.render('portfolio', {
              products,
              items,
              cart: req.session.cart
            });
          }
        });
    }
  })
});

router.get('/product-details/:product', (req, res, next) => {
  const slug = req.params.product;

  Product.findOne({slug: slug}, (err, product) => {
    if(err) console.log(err);

    res.render('product-details', {
      product,
      image: product.image,
      id: product._id,
      title: product.title,
      desc: product.desc,
      price: product.price
    });
  });
}); 

router.get('/portfolio/view-details/:item', (req, res, next) => {
  const slug = req.params.item;

  Portfolio.findOne({slug: slug}, (err, item) => {
    if(err) console.log(err);

    res.render('view_details', {
      item,
      image: item.image,
      id: item._id,
      title: item.title,
      desc: item.desc,
    });
  });
}); 

router.post('/send-message', async (req, res) => {

  // const transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: 'email',
  //     pass: 'pass'
  //   }
  // });

  const transporter = nodemailer.createTransport({
    host: process.env.CONTACT_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.CONTACT_MAIL,
      pass: process.env.CONTACT_PASS
    }
  });

  const info =  await transporter.sendMail({
    from: process.env.CONTACT_MAIL,
    to: process.env.CONTACT_MAIL,
    subject: req.body.subject,
    text: `
      Name: ${req.body.name}
      Email: ${req.body.email}
      Message: ${req.body.message}
    `
  }); 
  res.sendStatus(200);
});

// Exports
module.exports = router;