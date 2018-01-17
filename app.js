var express          = require("express"),
    app              = express(),
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"),
    passport         = require("passport"),
    methodOverride   = require("method-override"),
    LocalStrategy    = require("passport-local"),
    request          = require("request"),
    Comment          = require("./models/comment"),
    Campground       = require("./models/campground"),
    User             = require("./models/user"),
    seedDB           = require("./seed");

var campgroundsRoute = require("./routes/campgrounds"),
     commentsRoute   = require("./routes/comments"),
     indexRoute      = require("./routes/index");

// seed the db    seedDB();

mongoose.connect("mongodb://localhost/yelp_campv8");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

var url = "";


request('url', function(error, response, body){
  if(!error && response.statusCode==200){
    var parsedData = JSON.parse(body);
    console.log(parsedData);
  }
});

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "I'm very concerned about my dog's wellbeing!",
    resave: false ,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res){
    res.render("landing");
});

app.use("/campgrounds", campgroundsRoute);
app.use(commentsRoute);
app.use(indexRoute);



//===============================
app.listen(3000, function(){
   console.log("The Travella Server Has Started!");
});
