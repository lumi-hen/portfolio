const express=require('express');
const router=express.Router();
// get category model
const Category=require('../models/category');
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

// Get category index
router.get('/categories', isAdmin, (req,res,next) =>{
    Category.find(function(err, categories) {
        if(err) return console.log(err);

        res.render('admin/categories', {
            categories,
            title: "Categories"
        })
    });
});

// get add category

router.get('/categories/add-category', isAdmin,(req,res,next) =>{
    let title="";

    res.render('admin/add_category',{
        title: "Add a new category",

    });
});



// POST add category
router.post('/categories/add-category',(req,res,next) =>{
    req.checkBody('title','Title must have a value').notEmpty();

    let title=req.body.title;
    let slug=title.replace(/\s+/g,'-').toLowerCase();
    
    let errors=req.validationErrors();
    if(errors)
    {
        res.render('../views/admin/add_category',{
            errors,
            title,
        });
    } else {  
        Category.findOne({slug:slug},function(err,category){
         if(category)
         {
             req.flash('danger','Category title exist choose another.');
             res.render('../views/admin/add_category',{
                title,
            });

         } else {
             let category=new Category({
                 title,
                 slug,
             });

             category.save(function(err){
                 if(err)
                 {
                     return console.log(err);
                 }

                 Category.find((err, categories) => {
                    if(err) {
                        console.log(err)
                    } else {
                        req.app.locals.categories = categories;
                    }
                 });
                 req.flash('success','Category added!');
                 res.redirect('/admin/categories');


             });
         }

        });

    }

    
});

// get edit category

router.get('/categories/edit-category/:id', isAdmin,(req,res,next) =>{
    
    Category.findById(req.params.id, function(err, category) {
        if(err) return console.log(err);

        res.render('admin/edit_category',{
            title: category.title,
            id: category._id
    
        });
    });

});

// POST edit category
router.post('/categories//edit-category/:id',(req,res,next) =>{
    req.checkBody('title','Title must have a value').notEmpty();

    let title=req.body.title;
    let slug=title.replace(/\s+/g,'-').toLowerCase();
    let id = req.params.id;
    
    let errors=req.validationErrors();
    if(errors)
    {
        res.render('admin/edit_category',{
            errors,
            title,
            id,
        });
    } else {  
        Category.findOne({slug:slug, _id:{'$ne': id}},function(err,category){
         if(category)
         {
             req.flash('danger','Category title exists choose another.');
             res.render('admin/edit_category',{
                title,
                id,
            });

         } else {
             Category.findById(id, function(err, category) {
                if(err) console.log(err);

                category.title = title;
                category.slug = slug;

                category.save(function(err){
                    if(err) return console.log(err);

                    Category.find((err, categories) => {
                        if(err) {
                            console.log(err)
                        } else {
                            req.app.locals.categories = categories;
                        }
                    });

                    req.flash('success','Category edited!');
                    res.redirect('/admin/categories/edit-category/'+ id);
   
   
                });
             });
         }
        });
    }
});

// Get delete category & remove
router.get('/categories/delete-category/:id', isAdmin,(req,res,next) =>{
    Category.findByIdAndDelete(req.params.id, function(err) {
        if(err) return console.log(err);

        req.flash('success','Category deleted!');
        res.redirect('/admin/categories');
    });
});


module.exports=router;
