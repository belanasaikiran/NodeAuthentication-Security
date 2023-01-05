//jshint esversion:6
// Dotenv
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport"); // no need of importing passport-local
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

console.log(process.env.SECRET);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Session Info
app.use(
  session({
    secret: "Our little Secret",
    resave: false,
    saveUninitialized: false,
  })
);

// initializing passport
app.use(passport.initialize());
app.use(passport.session());

// Database
mongoose.set("strictQuery", false); // for latest node versions
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

// creating new schema if not existing and using it for user information storage
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);


// serialization & deserialization of user data from passport.js 
passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//TODO
//  GET Routes
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    
});

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated) {
    res.render("secrets");
  } else {
    res.redirect("login");
  }
});

//  POST Register app
app.post("/register", (req, res) => {
  // passport-local-mongoose -> read documentation for registering data
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    }
  );
});

// Login POST   
app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, (err) => {
    if (err) {
      console.log("Oops!", err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});




app.listen(3000, function () {
  console.log("Server started on port 3000");
});
