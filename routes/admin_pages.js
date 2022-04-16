const express=require('express');
const router=express.Router();
// get pages model
const Page=require('../models/page');
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

// Get pages index
router.get('/', isAdmin, (req,res,next) =>{
    Page.find({}).sort({sorting: 1}).exec((err, pages) => {
        res.render('admin/pages', {
            pages: pages,
        })
    });
});

// get add page

router.get('/add-page', isAdmin,(req,res,next) =>{
    var title="";
    var slug="";
    var content="";

    res.render('admin/add_page',{
        title,
        slug,
        content,

    });
});

// POST add page
router.post('/add-page',(req,res,next) =>{
    req.checkBody('title','Title must have a value').notEmpty();
    req.checkBody('content','Content  must have a value').notEmpty();
    var title=req.body.title;
    var slug=req.body.slug.replace(/\s+/g,'-').toLowerCase();
    if(slug=="")
    slug=title.replace(/\s+/g,'-').toLowerCase();
    var content=req.body.content;
    
    var errors=req.validationErrors();
    if(errors)
    {
        res.render('../views/admin/add_page',{
            errors,
            title,
            slug,
            content,
        });
    } else {  
        Page.findOne({slug:slug},function(err,page){
         if(page)
         {
             req.flash('danger','page slug exist choose another.');
             res.render('../views/admin/add_page',{
                errors,
                title,
                slug,
                content,
            });

         } else {
             var page=new Page({
                 title,
                 slug,
                 content,
                 sorting: 100,
             });

             page.save(function(err){
                if(err)
                {
                    return console.log(err);    
                }
                Page.find({}).sort({sorting: 1}).exec((err, pages) => {
                    if(err) {
                        console.log(err)
                    } else {
                        req.app.locals.pages = pages;
                    }
                });
                 req.flash('success','Page added!');
                 res.redirect('/admin/pages');


             });
         }

        });

    }

    
});

// Sort pages function
function sortPages(ids, callback) {
    var count = 0;

    for(var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;
        (function(count) {
            Page.findById(id, function(err, page) {
                page.sorting = count;
                page.save(function(err) {
                    if(err) return console.log(err);
                ++count;
                if(count >= ids.length) {
                    callback();
                }
                });
            });
        }) (count);
    }
}

// POST reorder pages
router.post('/reorder-pages',(req,res,next) =>{
    var ids = req.body['id[]'];

    sortPages(ids, function() {
        Page.find({}).sort({sorting: 1}).exec((err, pages) => {
            if(err) {
                console.log(err)
            } else {
                req.app.locals.pages = pages;
            }
        });
    });

});

// get edit page

router.get('/edit-page/:id', isAdmin, (req,res,next) =>{
    
    Page.findById(req.params.id, function(err, page) {
        if(err) return console.log(err);

        res.render('admin/edit_page',{
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });

});

// POST edit page
router.post('/edit-page/:id',(req,res,next) =>{
    req.checkBody('title','Title must have a value').notEmpty();
    req.checkBody('content','Content  must have a value').notEmpty();
    var title=req.body.title;
    var slug=req.body.slug.replace(/\s+/g,'-').toLowerCase();
    if(slug=="")
    slug=title.replace(/\s+/g,'-').toLowerCase();
    var content=req.body.content;
    var id = req.params.id;
    
    var errors=req.validationErrors();
    if(errors)
    {
        res.render('admin/edit_page',{
            errors,
            title,
            slug,
            content,
            id,
        });
    } else {  
        Page.findOne({slug:slug, _id:{'$ne': id}},function(err,page){
         if(page)
         {
             req.flash('danger','page slug exist choose another.');
             res.render('admin/edit_page',{
                errors,
                title,
                slug,
                content,
                id,
            });

         } else {
             Page.findById(id, function(err, page) {
                if(err) console.log(err);

                page.title = title;
                page.slug = slug;
                page.content = content;

                page.save(function(err){
                    if(err)
                    {
                        return console.log(err);
                    }

                    Page.find({}).sort({sorting: 1}).exec((err, pages) => {
                        if(err) {
                            console.log(err)
                        } else {
                            req.app.locals.pages = pages;
                        }
                    });

                    req.flash('success','Page edited!');
                    res.redirect('/admin/pages/edit-page/'+ page.id);
   
   
                });
             });
         }
        });
    }
});

// Get delete page
router.get('/delete-page/:id', isAdmin, (req,res,next) =>{
    Page.findByIdAndDelete(req.params.id, function(err) {
        if(err) return console.log(err);

        Page.find({}).sort({sorting: 1}).exec((err, pages) => {
            if(err) {
                console.log(err)
            } else {
                req.app.locals.pages = pages;
            }
        });

        req.flash('success','Page deleted!');
        res.redirect('/admin/pages');
    });
});


module.exports=router;
