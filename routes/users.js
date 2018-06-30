var express = require("express");
var router = express.Router();
var Stamp = require("../models/stamp");
var User = require("../models/user");
var _ = require("underscore");

// Show details of a particular user
router.get("/users/:id", verifyUser, (req, res) => {
  var selectedHood = req.query.hood;

  Stamp.find({ neighborhood: selectedHood }, (err, selectedHoodStamps) => {
    User.findById(req.params.id).exec(function(err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        res.render("users/show", {
          title: foundUser.name,
          user: foundUser,
          selectedHood: selectedHood,
          stamps: selectedHoodStamps
        });
      }
    }); // end of User.find bracket
  }); // end of Stamp.find bracket
});

// Add a completed stamp to a user's passport
router.post("/users/:id/:stamp_id", verifyUser, (req, res) => {
  var completedStamp = req.params.stamp_id;
  var submission = req.body.submission.toLowerCase();
  var neighborhood = req.body.neighborhood;
  switch (neighborhood) {
    case "N":
      neighborhood = "nStamps";
      done = "nStampsDone";
      break;
    case "NW":
      neighborhood = "nwStamps";
      done = "nwStampsDone";
      break;
    case "NE":
      neighborhood = "neStamps";
      done = "neStampsDone";
      break;
    case "SW":
      neighborhood = "swStamps";
      done = "swStampsDone";
      break;
    case "SE":
      neighborhood = "seStamps";
      done = "seStampsDone";
      break;
    default:
      console.log("I do not recognize that neighborhood");
  }

  Stamp.findById(req.params.stamp_id, function(err, stamp) {
    let answer = stamp.answer;

    User.findById(req.params.id, function(err, user) {
      if (err) {
        res.redirect("back");
        // Check answer below
      } else if (submission === answer) {
        user[neighborhood].push(completedStamp);
        user.save();
        stamp.usersCompleted++;
        stamp.save();

        const requiredStamps = {
          nStamps: [
            "5b1cb7b327c85506ec91f267",
            "5b1d9556d47f3047a062cf34",
            "5b1d96a0adb10f43104375fc",
            "5b1da9a1d36cbb4900b2d57e",
            "5b1dbfe7d36cbb4900b2d585",
            "5b1dc265d36cbb4900b2d586",
            "5b1dc6027779d11efc49d34c",
            "5b1cb8deba005f1d94c7c3f0"
          ],
          nwStamps: [
            "5b1da766d36cbb4900b2d57c",
            "5b1dcb32b6b19f216019241d",
            "5b23471f434bcd00142962ca",
            "5b27cc84e7eb5300148fe69e",
            "5b28577ead2f2000148bdcfa",
            "5b28588fad2f2000148bdcfb",
            "5b285a26ad2f2000148bdcfc",
            "5b2b27614c33551a205c4af8"
          ],
          neStamps: [
            "5b1da8b7d36cbb4900b2d57d",
            "5b2744279a0ab0001464b0b7",
            "5b2744d19a0ab0001464b0b8",
            "5b27434f9a0ab0001464b0b6",
            "5b287befbe268c001439c450",
            "5b2888926b75810014d7c343",
            "5b28879d6b75810014d7c342",
            "5b2b195373b2cd0014f573af"
          ],
          swStamps: [
            "5b1db017d36cbb4900b2d580",
            "5b258378c1770700140cbe88",
            "5b2341f2434bcd00142962c9",
            "5b2585b5c1770700140cbe89",
            "5b2736519a0ab0001464b0b3",
            "5b273ea29a0ab0001464b0b4",
            "5b285e04ad2f2000148bdcfe",
            "5b285fe0ad2f2000148bdcff"
          ],
          seStamps: [
            "5b1cbc5cba005f1d94c7c3f2",
            "5b2097b09e31a72974a369e6",
            "5b20a316c3c219420824728c",
            "5b20a753c3c219420824728d",
            "5b21df6edeb1a553b0bfe3ab",
            "5b21ec4edeb1a553b0bfe3ac",
            "5b21f76fdeb1a553b0bfe3af",
            "5b2336c4e718e20014598aa0"
          ]
        };

        var requiredStampsDone = _.intersection(
          requiredStamps[neighborhood],
          user[neighborhood]
        );

        // Check if user level should be increased
        if (
          requiredStampsDone.length === 8 &&
          !user[done] &&
          user[neighborhood].length >= 10
        ) {
          user.level++;
          user[done] = true;
        }

        res.redirect("/users/" + user._id);
      } else {
        res.render("wronganswer", {
          stamp_id: req.params.stamp_id,
          title: "Wrong Answer"
        });
      }
    });
  });
});
// End of route to add a completed stamp to a user's passport

function verifyUser(req, res, next) {
  if (req.isAuthenticated()) {
    User.findById(req.params.id, function(err, foundUser) {
      if (err) {
        res.redirect("back");
      } else {
        if (foundUser._id.equals(req.user._id)) {
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

module.exports = router;
