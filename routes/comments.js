var express = require("express");
var router = express.Router();
var Stamp = require("../models/stamp");
var Comment = require("../models/comment");

// Post a new comment
router.post("/stamps/:id/comments", loginCheck, (req, res) => {
  Stamp.findById(req.params.id, function(err, stamp) {
    if (err) {
      console.log(err);
      res.redirect("/stamps");
    } else {
      Comment.create(req.body.comment, function(err, comment) {
        if (err) {
          console.log(err);
        } else {
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.author.level = req.user.level;
          comment.save();
          stamp.comments.push(comment);
          stamp.save();
          res.redirect("/stamps/" + stamp._id);
        }
      });
    }
  });
});

// UI for editing a comment
router.get(
  "/stamps/:id/comments/:comment_id/edit",
  checkCommentOwnership,
  (req, res) => {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err) {
        res.redirect("back");
      } else {
        res.render("comments/edit", {
          stamp_id: req.params.id,
          comment: foundComment,
          title: `Edit Comment`
        });
      }
    });
  }
);

// Edit an existing comment
router.put(
  "/stamps/:id/comments/:comment_id",
  checkCommentOwnership,
  (req, res) => {
    Comment.findByIdAndUpdate(
      req.params.comment_id,
      req.body.comment,
      (err, updatedComment) => {
        if (err) {
          res.redirect("back");
        } else {
          res.redirect("/stamps/" + req.params.id);
        }
      }
    );
  }
);

// Delete a comment
router.delete(
  "/stamps/:id/comments/:comment_id",
  checkCommentOwnership,
  (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, err => {
      if (err) {
        res.redirect("back");
      } else {
        res.redirect("/stamps/" + req.params.id);
      }
    });
  }
);

function checkCommentOwnership(req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err) {
        res.redirect("back");
      } else {
        if (foundComment.author.id.equals(req.user._id)) {
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
