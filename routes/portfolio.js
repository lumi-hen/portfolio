const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const nodemailer = require('nodemailer');
const { response } = require('express');
require('dotenv').config();


// Get all products
router.get('/', (req,res,next) =>{
  Product.find((err, products) => {
      if(err) console.log(err);

      res.render('portfolio',{
          products: products,
      });
  }); 
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