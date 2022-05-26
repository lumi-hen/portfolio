const express=require('express');
const router=express.Router();
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');
const path = require('path');
// get Portfolio model
const Portfolio=require("../models/portfolio");
// get cat model
const Category = require("../models/category")
const auth = require('../config/auth');
const isAdmin = auth.isAdmin; 

// Get index
router.get('/portfolio', isAdmin,(req, res) => {
  Portfolio.find(function(err, items) {
    res.render('admin/portfolio_items', {
        items,
        title: "Portfolio"
    })
});
});

// Get add portfolio item
router.get('/portfolio/add-item', isAdmin, (req,res,next) =>{
  let title="";
  let desc="";

  Category.find(function(err, categories) {
      res.render('admin/add_portfolio',{
          title,
          desc,
          categories,
      });
  });
});

// POST add portfolio item
router.post('/portfolio/add-item',(req,res,next) =>{
    
  // let imageFile = typeof req.files.image !== "null" ? req.files.image.name : "";
  if(!req.files){ imageFile =""; }
      if(req.files){
      var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
      }

  req.checkBody('title','Title must have a value').notEmpty();
  req.checkBody('desc','Description must have a value').notEmpty();
  req.checkBody('image', 'You must upload an image').isImage(imageFile);
  
  let title=req.body.title;
  let slug=title.replace(/\s+/g,'-').toLowerCase();
  let desc=req.body.desc;
  let category=req.body.category;
  
  let errors=req.validationErrors();
  if(errors)
  {
      Category.find(function(err, categories) {
          res.render('admin/add_portfolio', {
              errors,
              title,
              desc,
              categories
          });
      });
  } else {  
      Portfolio.findOne({slug:slug},function(err,item){
       if(item)
       {
           req.flash('danger','Product title exist, choose another.');
           Category.find(function(err, categories) {
              if(err) return console.log(err);

              res.render('admin/add_portfolio', {
                  title,
                  desc,
                  categories,
              });
          });

       } else {

           let item=new Portfolio({
               title,
               slug,
               category,
               desc,
               image: imageFile,
           });

           item.save(async function(err){
              if(err) return console.log(err);

              await mkdirp(`public/portfolio_images/${item._id}`);
              
              await mkdirp(`public/portfolio_images/${item._id}/gallery`);
              
              await mkdirp(`public/portfolio_images/${item._id}/gallery/thumbs`);
              


              if(imageFile !== "") {
                  // let extension = path.extname(imageFile);
                  let portfolioImage = req.files.image;
                  let path = 'public/portfolio_images/' + item._id + '/'  + imageFile;
                  // console.log(imageFile);

                  portfolioImage.mv(path, function(err) {
                      if(err) return console.log(err);
                  });

           }});

              req.flash('success','Item added!');
              res.redirect('/admin/portfolio');
       }

      });

  }

  
});

// get edit portfolio item

router.get('/portfolio/edit-item/:id', isAdmin, (req,res,next) =>{
    
  let errors;

  if(req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  Category.find(function(err, categories) {
      Portfolio.findById(req.params.id, (err, item) => {
          if(err) {
              console.log(err);
              res.redirect('/admin/portfolio');
          } else {
              let gallerDir = 'public/portfolio_images/' + item._id + '/gallery';
              let galleryImages = null;

              fs.readdir(gallerDir, (err, files) => {
                  if(err) {
                      console.log(err);
                  } else {
                      galleryImages = files;

                      res.render('admin/edit_portfolio', {
                          title: item.title,
                          errors: errors,
                          desc: item.desc,
                          categories: categories,
                          category: item.category.replace(/\s+/g, '-').toLowerCase(),
                          image: item.image,
                          galleryImages: galleryImages,
                          id: item._id
                      });
                  }
              });
          }
      });

  });

});

// POST edit portfolio item
router.post('/portfolio/edit-item/:id',(req,res,next) =>{
  // let imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
  if(!req.files){ imageFile =""; }
  if(req.files){
    var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
  }

  req.checkBody('title','Title must have a value').notEmpty();
  req.checkBody('desc','Description must have a value').notEmpty();
  req.checkBody('image', 'You must upload an image').isImage(imageFile);
  
  let title=req.body.title;
  let slug=title.replace(/\s+/g,'-').toLowerCase();
  let desc=req.body.desc;
  let category=req.body.category;
  let pimage = req.body.pimage;
  let id = req.params.id;
  
  let errors=req.validationErrors();

  if(errors) {
      req.session.errors = errors;
      res.redirect('/admin/portfolio/edit-item' + id);
  } else {
      Portfolio.findOne({slug: slug, _id: {'$ne': id}}, function(err, item) {
          if(err) console.log(err);

          if(item) {
              req.flash('danger', 'Product title exists, choose another.');
              res.redirect('/admin/portfolio/edit-item' + id);
          } else {
              Portfolio.findById(id, function(err, item) {
                  if(err) console.log(err);

                  item.title = title;
                  item.slug = slug;
                  item.desc = desc;
                  item.category = category;
                  if(imageFile != "") item.image = imageFile;

                  item.save(function(err) {
                      if(err) console.log(err);

                      if(imageFile != "") {
                          if(pimage != "") {
                              fs.remove('public/portfolio_images/' + id + '/' + pimage, function(err) {
                                  if(err) console.log(err);
                              });
                          }

                          // let extension = path.extname(imageFile);
                          let portfolioImage = req.files.image;
                          let path = 'public/portfolio_images/' + id + '/'  + imageFile;
                          // console.log(imageFile);

                           portfolioImage.mv(path, function(err) {
                              if(err) console.log(err);
                          });

                      }

                      req.flash('success','Product edited!');
                      res.redirect('/admin/portfolio');
                  });
              });
          }
      });
  }
});

// Get delete portfolio item
router.get('/portfolio/delete-item/:id', isAdmin, (req,res,next) =>{
  let id = req.params.id;
  let path = 'public/portfolio_images/' + id;

  fs.remove(path, err => {
      if(err) {
          console.log(err);
      } else {
          Portfolio.findByIdAndDelete(id, err => {
              if(err) console.log(err);
          });

          req.flash('success','Item deleted!');
          res.redirect('/admin/portfolio');
      }
  });
});

module.exports = router;
