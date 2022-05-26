const express=require('express');
const router=express.Router();
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');
// get Products model
const Product=require('../models/product');
// get Category model
const Category=require('../models/category');
const auth = require('../config/auth');
const isAdmin = auth.isAdmin; 

// Get product index
router.get('/products', isAdmin, (req,res,next) =>{

    Product.find(function(err, products) {
        res.render('admin/products', {
            products,
            title: "Products"
        })
    });
});

// get add product

router.get('/products/add-product', isAdmin, (req,res,next) =>{
    let title="";
    let desc="";
    let price="";

    Category.find(function(err, categories) {
        res.render('admin/add_product',{
            title,                                                                                                                                                                          
            desc,
            categories,
            price,
    
        });
    });
});



// POST add product
router.post('/products/add-product',(req,res,next) =>{
    
    let imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    // if(!req.files){ imageFile =""; }
    //     if(req.files){
    //     let imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
    //     }

    req.checkBody('title','Title must have a value').notEmpty();
    req.checkBody('desc','Description must have a value').notEmpty();
    req.checkBody('price','Price must have a value').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
    
    let title=req.body.title;
    let slug=title.replace(/\s+/g,'-').toLowerCase();
    let desc=req.body.desc;
    let price=req.body.price;
    let category=req.body.category;
    
    let errors=req.validationErrors();
    if(errors)
    {
        Category.find(function(err, categories) {
            res.render('admin/add_product', {
                errors,
                title,
                desc,
                categories,
                price,
            });
        });
    } else {  
        Product.findOne({slug:slug},function(err,product){
         if(product)
         {
             req.flash('danger','Product title exist, choose another.');
             Category.find(function(err, categories) {
                if(err) return console.log(err);

                res.render('admin/add_product', {
                    title,
                    desc,
                    categories,
                    price,
                });
            });

         } else {
             let price2 = parseFloat(price).toFixed(2);

             let product=new Product({
                 title,
                 slug,
                 desc,
                 price: price2,
                 category,
                 image: imageFile,
             });

             product.save(async function(err){
                if(err) return console.log(err);

                await mkdirp(`public/product_images/${product._id}`);
                
                await mkdirp(`public/product_images/${product._id}/gallery`);
                
                await mkdirp(`public/product_images/${product._id}/gallery/thumbs`);
                


                if(imageFile !== "") {
                    // let extension = path.extname(imageFile);
                    let productImage = req.files.image;
                    let path = 'public/product_images/' + product._id + '/'  + imageFile;
                    // console.log(imageFile);

                    productImage.mv(path, function(err) {
                        if(err) return console.log(err);
                    });

             }});

                req.flash('success','Product added!');
                res.redirect('/admin/products');
         }

        });

    }

    
});

// get edit product

router.get('/products/edit-product/:id', isAdmin, (req,res,next) =>{
    
    let errors;

    if(req.session.errors) errors = req.session.errors;
    req.session.errors = null;

    Category.find(function(err, categories) {
        Product.findById(req.params.id, (err, product) => {
            if(err) {
                console.log(err);
                res.redirect('/admin/products');
            } else {
                let gallerDir = 'public/product_images/' + product._id + '/gallery';
                let galleryImages = null;

                fs.readdir(gallerDir, (err, files) => {
                    if(err) {
                        console.log(err);
                    } else {
                        galleryImages = files;

                        res.render('admin/edit_product', {
                            title: product.title,
                            errors: errors,
                            desc: product.desc,
                            categories: categories,
                            category: product.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(product.price).toFixed(2),
                            image: product.image,
                            galleryImages: galleryImages,
                            id: product._id
                        });
                    }
                });
            }
        });

    });

});

// POST edit product
router.post('/products/edit-product/:id',(req,res,next) =>{
    // let imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    if(!req.files){ imageFile =""; }
    if(req.files){
    let imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
    }

    req.checkBody('title','Title must have a value').notEmpty();
    req.checkBody('desc','Description must have a value').notEmpty();
    req.checkBody('price','Price must have a value').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
    
    let title=req.body.title;
    let slug=title.replace(/\s+/g,'-').toLowerCase();
    let desc=req.body.desc;
    let price=req.body.price;
    let category=req.body.category;
    let pimage = req.body.pimage;
    let id = req.params.id;
    
    let errors=req.validationErrors();

    if(errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product' + id);
    } else {
        Product.findOne({slug: slug, _id: {'$ne': id}}, function(err, product) {
            if(err) console.log(err);

            if(product) {
                req.flash('danger', 'Product title exists, choose another.');
                res.redirect('/admin/products/edit-product' + id);
            } else {
                Product.findById(id, function(err, product) {
                    if(err) console.log(err);

                    product.title = title;
                    product.slug = slug;
                    product.desc = desc;
                    product.price = parseFloat(price).toFixed(2);
                    product.category = category;
                    if(imageFile != "") product.image = imageFile;

                    product.save(function(err) {
                        if(err) console.log(err);

                        if(imageFile != "") {
                            if(pimage != "") {
                                fs.remove('public/product_images/' + id + '/' + pimage, function(err) {
                                    if(err) console.log(err);
                                });
                            }

                            // let extension = path.extname(imageFile);
                            let productImage = req.files.image;
                            let path = 'public/product_images/' + id + '/'  + imageFile;
                            // console.log(imageFile);

                             productImage.mv(path, function(err) {
                                if(err) console.log(err);
                            });

                        }

                        req.flash('success','Product edited!');
                        res.redirect('/admin/products/edit-product/' + id);
                    });
                });
            }
        });
    }
});

// Get delete product
router.get('/products/delete-product/:id', isAdmin, (req,res,next) =>{
    let id = req.params.id;
    let path = 'public/product_images/' + id;

    fs.remove(path, err => {
        if(err) {
            console.log(err);
        } else {
            Product.findByIdAndDelete(id, err => {
                if(err) console.log(err);
            });

            req.flash('success','Product deleted!');
            res.redirect('/admin/products');
        }
    });
});


module.exports=router;
