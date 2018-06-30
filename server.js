//===================
//Modules
//===================
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var methodOverride = require("method-override");
var LocalStrategy = require("passport-local");
var path = require("path");
var favicon = require("serve-favicon");

var keys = require("./config/keys");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(favicon(path.join(__dirname, "public", "img", "favicon.ico")));

//===================
//Models / MongoDB
//===================
mongoose.connect(keys.mongoURI);
var User = require("./models/user");
var Stamp = require("./models/stamp");
var Comment = require("./models/comment");

//===================
//Authentication configurfation
//===================
app.use(
  require("express-session")({
    secret: keys.secretKey,
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

//===================
//Routers
//===================
var indexRoutes = require("./routes/index");
app.use(indexRoutes);
var stampRoutes = require("./routes/stamps");
app.use(stampRoutes);
var commentRoutes = require("./routes/comments");
app.use(commentRoutes);
var userRoutes = require("./routes/users");
app.use(userRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log("Passportlandia is up and running...");
});
