var express = require("express");
var router = express.Router();
var passport = require("passport");
var request = require("request");
var User = require("../models/user");
var keys = require("../config/keys");

// Landing page
router.get("/", (req, res) => {
  request(
    `http://api.openweathermap.org/data/2.5/weather?zip=97209&units=imperial&APPID=${
      keys.openWeatherApiKey
    }`,
    (error, response, body) => {
      if (!error && response.statusCode == 200) {
        var weatherData = JSON.parse(body);
        var unixSunset = weatherData.sys.sunset;
        var sunsetDate = new Date(unixSunset * 1000);
        var sunsetHour = sunsetDate.getHours() + 5;
        var sunsetMinutes = "0" + sunsetDate.getMinutes();
        var sunsetTime = sunsetHour + ":" + sunsetMinutes.substr(-2) + " PM";
        var temp = weatherData.main.temp.toFixed();
        var weatherDescription = weatherData.weather[0].description;
        res.render("landing", {
          title: "Passportlandia",
          sunsetTime: sunsetTime,
          temp: temp,
          weatherDescription: weatherDescription
        });
      }
    }
  );
  //res.render('landing', {title: 'Passportlandia'});
});

// About route
router.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

// Show sign up form
router.get("/signup", (req, res) => {
  res.render("signup", { title: "Signup", userAlreadyExists: false });
});

// Signup post route
router.post("/signup", (req, res) => {
  var newUser = new User({
    username: req.body.username,
    email: req.body.email,
    level: 0,
    nStampsDone: false,
    neStampsDone: false,
    nwStampsDone: false,
    seStampsDone: false,
    swStampsDone: false
  });

  User.register(newUser, req.body.password, function(err, user) {
    if (err.name === "UserExistsError") {
      return res.render("signup", { title: "Signup", userAlreadyExists: true });
    } else
      passport.authenticate("local")(req, res, function() {
        res.redirect("stamps");
      });
  });
});

// Show login form
router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

// Login post route
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/stamps",
    failureRedirect: "/login"
  }),
  function(req, res) {}
);

// Logout route
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/stamps");
});

// Troubleshooting route
router.get("/troubleshooting", (req, res) => {
  res.render("troubleshooting", { title: "Troubleshooting" });
});

// Terms route
router.get("/terms", (req, res) => {
  res.render("terms", { title: "Terms" });
});

module.exports = router;
