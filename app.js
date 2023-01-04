//jshint esversion:6
// Dotenv
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose")

// Encryption
// const encrypt = require('mongoose-encryption')
const md5 = require('md5') 

// bcrypt - recommended for encryption of passwords
// const bcrypt = require('bcrypt')
// const saltRounds = 10

const app = express();


console.log(process.env.API_KEY)

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));



// Database
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true})


// creating new schema if not existing and using it for user information storage
const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields:  ['password']})

const User = new mongoose.model("User", userSchema)



//TODO
//  GET Routes
app.get("/", (req, res)=> {
    res.render("home")
})

app.get("/login", (req, res)=> {
    res.render("login")
})

app.get("/register", (req, res)=> {
    res.render("register")
})
app.get("/logout", (req, res)=> {
    res.render("home")
})




//  POST Register app
app.post("/register", (req, res)=> {
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
    })
    newUser.save((err)=>{
        if(err){
            res.send(err);
        } else{
            res.render("secrets")
        }
    })
})


// Login POST
app.post("/login", (req,res)=> {
    const username = req.body.username
    const password = md5(req.body.password)


    User.findOne({email: username}, function(err, foundUser){
        if(err){
            console.log(err)
        } else{
            if(foundUser){
                if(foundUser.password === password){
                    res.render('secrets')
                }
            }
        }
    })
})


app.listen(3000, function() {
  console.log("Server started on port 3000");
});