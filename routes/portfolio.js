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

// Exports
module.exports = router;