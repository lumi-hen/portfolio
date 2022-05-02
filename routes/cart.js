const express=require('express');
const router=express.Router();
const Product = require('../models/product');

// Get add product to cart
router.get('/add/:product',(req,res,next) =>{
    let slug = req.params.product;

    Product.findOne({slug: slug}, (err, product) => {
        if(err) console.log(err);

        if(typeof req.session.cart =="undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                quantity: 1,
                price: parseFloat(product.price).toFixed(2),
                image: "/product_images/" + product._id + '/' + product.image,
            });

        // if (typeof window !== 'undefined') {
        //     // Perform localStorage action
        //     let lsCart = [];
        //     if(localStorage.getObj('lscart')) {
        //         lsCart = localStorage.getItem('lscart');
    
        //         lsCart.push({
        //             title: slug,
        //             quantity: 1,
        //             price: parseFloat(product.price).toFixed(2),
        //             image: "/product_images/" + product._id + '/' + product.image,
        //         });
        //         localStorage.setObj('lscart', lsCart);
        //   }

        } else {

            let cart = req.session.cart;
            let newItem = true;

            for(let i = 0; i < cart.length; i++) {
                if(cart[i].title == slug) {
                    cart[i].quantity += 1;
                    newItem = false;
                    break;
                }
            }

            if(newItem == true) {
                cart.push({
                    title: slug,
                    quantity: 1,
                    price: parseFloat(product.price).toFixed(2),
                    image: "/product_images/" + product._id + '/' + product.image,
                });
            }
        }
        
        res.sendStatus(204);
        
    }); 
});

// Get checkout page
router.get('/checkout',(req,res,next) =>{
    if(req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart,
        });

    }
});

// Get update product
router.get('/update/:product',(req,res,next) =>{
    let slug = req.params.product;
    let cart = req.session.cart;
    let action = req.query.action;

    for(let i = 0; i < cart.length; i++) {
        if(cart[i].title == slug) {
            switch(action) {
                case "add":
                    cart[i].quantity++;
                    break;
                case "remove":
                    cart[i].quantity--;
                    if(cart[i].quantity < 1) {
                        cart.splice(i, 1);
                    }
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if(cart.length == 0) {
                        delete req.session.cart;
                    }
                    break;
                default:
                    console.log('update problem');
                    break;
            }
            break;
        }
    }

    req.flash('success', 'Cart updated!');
    res.redirect('/cart/checkout');

});

// Get clear cart 
router.get('/clear',(req,res,next) =>{
    delete req.session.cart;

    req.flash('success', 'Cart cleared!');
    res.redirect('/cart/checkout');
});

// Get buynow 
router.get('/buynow',(req,res,next) =>{
    delete req.session.cart;

    res.sendStatus(200);
});


module.exports=router;