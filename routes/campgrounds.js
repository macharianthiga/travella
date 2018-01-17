var express    = require("express");
var router     = express.Router();
var Campground = require("../models/campground");



//INDEX - show all campgrounds
router.get("/",  isLoggedIn, function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds:allCampgrounds, currentUser: req.user});
       }
    });
});

//CREATE - add new campground to DB
router.post("/",  isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name          = req.body.name;
    var image         = req.body.image;
    var desc          = req.body.description;
    var author        = {
        username: req.user.username,
        id: req.user._id
    }
    var newCampground = {name: name, image: image, description: desc, author: author};
    
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

//NEW - show form to create new campground
router.get("/new",  isLoggedIn, function(req, res){
   res.render("campgrounds/new", {currentUser: req.user}); 
});

// SHOW - shows more info about one campground
router.get("/:id",  isLoggedIn, function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
           
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground, currentUser: req.user});
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", checkOwnership, function(req, res){
    //check if the user is logged in
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                res.redirect("/campgrounds");
            } else{
            //does the user own the campground
            if(foundCampground.author.id.equals(req.user._id)){
                 res.render("campgrounds/edit", {campground: foundCampground});
            } else{
                res.send("You do not have permission to do that!");
                
            }
               
            }
        });
            
    }else{
        console.log("you do not have permission to do that");
        res.send("You do not have permission");
    }
   
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", function(req, res){
    
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground,  function(err, updatedCampground){
       if(err){
           res.redirect("/campgrounds");
       } else{
           res.redirect("/campgrounds/" + req.params.id)
       }
    });
    //redirect somewhere else
});

//DESTROY CAMPGROUND
router.delete("/:id", function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else{
            res.redirect("/campgrounds");
        }
    });
});


function isLoggedIn(req, res, next){
     if(req.isAuthenticated()){
         return next();
     }
     res.redirect("/login");
 }

function checkOwnership(req, res, next){
       if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                res.redirect("back");
            } else{
            //does the user own the campground
            if(foundCampground.author.id.equals(req.user._id)){
                 next();
            } else{
               res.redirect("back");
            }
               
            }
        });
            
    }else{
        res.redirect("back");
    }
   
}

module.exports = router;