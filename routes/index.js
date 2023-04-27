const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
//const passport = require('passport');

// Welcome Page
router.get("/", function(req, res){
    if (req.session.passport === undefined) {
      res.render("home", {session: 0});
    }
    else {
      res.render("home", {session: 1, userSession: req.session.passport.user});
    }
    
})

//GET CATEGORY
router.get("/category/:title", function(req,res) {
  const title = req.params.title;
  var titlecon;
  if (title === "csn") { 
    titlecon = "Cơ sở ngành";
  }
  if (title === "tldc") {
    titlecon = "Đại cương";
  }
  if (title === "others") {
    titlecon = "Khác";
  }
  //console.log(titlecon);
  Book.find({category: titlecon, statusBook: "True"})
  .then(function(foundBooks) {
    res.render("category", {
      title: titlecon,
      foundBooks: foundBooks
    });
  })
  .catch(function (err) {
    res.status(400).send(err);
  });
});

module.exports = router;
