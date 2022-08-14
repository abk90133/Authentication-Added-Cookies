//jshint esversion:6
require('dotenv').config();
const express = require("express");

const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));
//this has to be mentioned because of the express not allow any other CSS, IMages or any other folder to run, so we have to mention each and every file on the Public folder explicitally

//connecting to the MongoDB server, this initially requires the 3 steps:

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema ({ //this type of mongoose encryption is used when we want to encrypt a data
  email: String,
  password: String
});
//
// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptFields: ["password"]});
//we have removed the above line of code because of the MD5 hash function which we have used which will help us to Hash a function instread of
// encrypting it

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

//Used for registering the user to the User Database of MongoDB

app.post("/register", function(req, res){
  //added the bcrypt that will increase the number of rounds of hashes which added the security to our "PASSWORD" only.
  bcrypt.hash(req.body.password, saltRounds, function(err, hash){
    const newUser = new User({
      email: req.body.username,
      password: hash
    });
  });
  newUser.save(function(err){
    if(err){
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});



app.post("/login", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundOne){
    if(err){
      console.log(err);
    } else {
      if(foundOne){
        if(foundOne.password  === password){
          res.render("secrets");
        }
      }
    }
  });
});

app.listen(3000, function(){
  console.log("Port is running on 3000");
});

//copy npm i express body-parser request ejs
//to hyper terminal

//some testing is done
