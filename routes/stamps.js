var express = require("express");
var router = express.Router();
var Stamp = require("../models/stamp");
var Comment = require("../models/comment");

// Stamps index
router.get("/stamps", (req, res) => {
  var requestedPage = Number(req.query.stampsPage) * 12 - 12;
  var selectedHood = req.query.hood;
  var stampRequired = req.query.stampRequired;
  Stamp.find(
    {
      neighborhood: selectedHood || { $in: ["N", "NW", "NE", "SE", "SW"] },
      reqStamp: stampRequired || true,
      approved: true
    },
    (err, allStamps) => {
      if (err) {
        console.log(err);
      } else {
        res.render("stamps/index", {
          title: "Stamps",
          stamps: allStamps,
          selectedHood: selectedHood,
          pageIndex: req.query.stampsPage
        });
      }
    }
  )
    .skip(0 || requestedPage)
    .limit(12);
});

// Add new stamp route
router.post("/stamps", loginCheck, (req, res) => {
  var name = req.body.name;
  var hood = req.body.hood;
  var address = req.body.address;
  var image = req.body.image;
  var question = req.body.question;
  var answer = req.body.answer.toLowerCase();
  var description = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var newStamp = {
    name: name,
    neighborhood: hood,
    address: address,
    image: image,
    description: description,
    question: question,
    answer: answer,
    author: author,
    reqStamp: false,
    approved: false,
    usersCompleted: 0
  };
  Stamp.create(newStamp, (err, newlyCreated) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/stamps");
    }
  });
});

// Add stamp form
router.get("/stamps/new", loginCheck, (req, res) => {
  res.render("stamps/new", { title: "Add Stamp" });
});

// Show details of a particular stamp
router.get("/stamps/:id", (req, res) => {
  Stamp.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundStamp) {
      if (err) {
        res.redirect("back");
      } else {
        if (foundStamp.approved === true) {
          res.render("stamps/show", {
            title: foundStamp.name,
            stamp: foundStamp
          });
        } else {
          res.send("Your stamp is not approved!");
        }
      }
    });
});

// UI for editing a stamp
router.get("/stamps/:id/edit", verifyStampOwner, (req, res) => {
  Stamp.findById(req.params.id, (err, foundStamp) => {
    res.render("stamps/edit", {
      stamp: foundStamp,
      title: `Edit ${foundStamp.name}`
    });
  });
});

// Put route for editing a stamp
router.put("/stamps/:id", verifyStampOwner, (req, res) => {
  Stamp.findByIdAndUpdate(req.params.id, req.body.stamp, function(
    err,
    updatedStamp
  ) {
    if (err) {
      res.redirect("/stamps");
    } else {
      res.redirect("/stamps/" + req.params.id);
    }
  });
});

// Destroy route, however, whole route is commented out because it will be problematic for a user to add a stamp, have other users complete it, then have the user who created the stamp destroy it. If a stamp needs to be deleted, adminstrator will manually do so through MongoDB
/*router.delete('/stamps/:id', verifyStampOwner, (req, res) => {
   Stamp.findByIdAndRemove(req.params.id, function(err) {
      if (err) {
          res.redirect('/stamps');
      } else {
          res.redirect('/stamps');
      }
   });
});*/

function verifyStampOwner(req, res, next) {
  if (req.isAuthenticated()) {
    Stamp.findById(req.params.id, function(err, foundStamp) {
      if (err) {
        res.redirect("back");
      } else {
        if (foundStamp.author.id.equals(req.user._id)) {
          next();
        } else {
          res.redirect("back");
        }
      }
    });
  } else {
    res.redirect("back");
  }
}

function loginCheck(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
