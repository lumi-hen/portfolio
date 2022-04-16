const express=require('express');
const router=express.Router();
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');
const path = require('path');
// get Products model
const Product=require('../models/product');
// get Category model
const Category=require('../models/category');
const { mkdirpNativeSync } = require('mkdirp/lib/mkdirp-native');
const { title } = require('process');
const { runInNewContext } = require('vm');
const util = require('util');
const auth = require('../config/auth');
const isAdmin = auth.isAdmin; 

// Get product index
router.get('/', isAdmin, (req,res,next) =>{
    var count;

    Product.countDocuments(function(err, c) {
        count = c;

    });

    Product.find(function(err, products) {
        res.render('admin/products', {
            products,
            count,
        })
    });
});

// get add product

router.get('/add-product', isAdmin, (req,res,next) =>{
    var title="";
    var desc="";
    var price="";

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
router.post('/add-product',(req,res,next) =>{
    
    // var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    if(!req.files){ imageFile =""; }
        if(req.files){
        var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
        }

    req.checkBody('title','Title must have a value').notEmpty();
    req.checkBody('desc','Description must have a value').notEmpty();
    req.checkBody('price','Price must have a value').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
    
    var title=req.body.title;
    var slug=title.replace(/\s+/g,'-').toLowerCase();
    var desc=req.body.desc;
    var price=req.body.price;
    var category=req.body.category;
    
    var errors=req.validationErrors();
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
             var price2 = parseFloat(price).toFixed(2);

             var product=new Product({
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
                    // var extension = path.extname(imageFile);
                    var productImage = req.files.image;
                    var path = 'public/product_images/' + product._id + '/'  + imageFile;
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

router.get('/edit-product/:id', isAdmin, (req,res,next) =>{
    
    var errors;

    if(req.session.errors) errors = req.session.errors;
    req.session.errors = null;

    Category.find(function(err, categories) {
        Product.findById(req.params.id, (err, product) => {
            if(err) {
                console.log(err);
                res.redirect('/admin/products');
            } else {
                var gallerDir = 'public/product_images/' + product._id + '/gallery';
                var galleryImages = null;

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
router.post('/edit-product/:id',(req,res,next) =>{
    // var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    if(!req.files){ imageFile =""; }
    if(req.files){
    var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
    }

    req.checkBody('title','Title must have a value').notEmpty();
    req.checkBody('desc','Description must have a value').notEmpty();
    req.checkBody('price','Price must have a value').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
    
    var title=req.body.title;
    var slug=title.replace(/\s+/g,'-').toLowerCase();
    var desc=req.body.desc;
    var price=req.body.price;
    var category=req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;
    
    var errors=req.validationErrors();

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

                            // var extension = path.extname(imageFile);
                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/'  + imageFile;
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

// POST product gallery
router.post('/product-gallery/:id',(req,res,next) =>{
    
    var productImage = req.files.file;
    var id = req.params.id;
    var galleryPath = 'public/product_images/' + id + '/gallery/' + productImage.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + productImage.name;

    productImage.mv(galleryPath, function(err) {
        if(err) console.log(err);

        resizeImg(fs.readFileSync(galleryPath), {width: 100, height: 100}).then(function(buf) {
            fs.writeFileSync(thumbsPath, buf);
        });
    });

    res.sendStatus(200);

});

// Get delete image
router.get('/delete-image/:image', isAdmin, (req,res,next) =>{
    var galleryImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbsImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(galleryImage, err => {
        if(err) {
            console.log(err);
        } else {
            fs.remove(thumbsImage, err => {
                if(err) {
                    console.log(err);
                } else {
                    req.flash('success','Image deleted!');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    });
});

// Get delete product
router.get('/delete-product/:id', isAdmin, (req,res,next) =>{
    var id = req.params.id;
    var path = 'public/product_images/' + id;

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
