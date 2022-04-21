const express = require('express');
const router = express.Router();
const Product = require('../models/product');

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

// Exports
module.exports = router;