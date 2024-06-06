  //jshint esversion:6
require('dotenv').config();
const express = require("express");

const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
//PASSPORT NOT ONLY ADD COOKIES BUT ALSO REMEMBERS WHAT THE USER IS UPTO IN THE WEB PAGE, which is known as the "SESSION"
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

//Do read the comments here


const app = express();

//this has to be mentioned because of the express not allow any other CSS, IMages or any other folder to run, so we have to mention each and every file on the Public folder explicitally
app.use(express.static("public"));
//this has to be mentioned because of the express not allow any other CSS, IMages or any other folder to run, so we have to mention each and every file on the Public folder explicitally


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));


//this is used to save the session, As stated here it is using the session package i.e const session = require("express-session");
app.use(session({
  secret: "We have to remember this for future reference",
  resave: false,
  saveUninitialized: false
}));

//MOST IMPORTANT IS THAT HERE THE PLACEMENT OF THE CODE BELOW THE LINES IS VERY IMPORTANT BECAUSE JS EXECUTE THE CODE LINE BY LINES
//SO INITILAIZING THE PASSPORT AND THE COOKIES IS VERY MUCH STATED HERE

//can be seen at Passport.org/documentation/session
app.use(passport.initialize());
app.use(passport.session());

//connecting to the MongoDB server
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});


//initializing a schema to our Mongodb so that we can declare a schema and use it on the server
const userSchema = new mongoose.Schema ({ //this type of mongoose encryption is used when we want to encrypt a data
  email: String,
  password: String
});
//
// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptFields: ["password"]});
//we have removed the above line of code because of the MD5 hash function which we have used which will help us to Hash a function instread of
// encrypting it

//this plugin is used to Encrypt the Mongoose, I.ee Hashing and Salting of the data we will be putting into the mongoose
userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model("User", userSchema);


//This is used for the Locall configuration of the passport
passport.use(User.createStrategy());

//What this searialize and deserealise is doing is it is adding the information of the user to the cookies so that it can Authenticate the user information when they are present and when the
//info is deleted
//they are also important for the security purpose also because they will be terminating you when you have exited the code.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


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

//This is our most Confidential page that will only allow us get in only when the ser is asking to get inside it is "AUTHENTICATED".
app.get("/secrets", function(req, res){
  if(req.isAuthenticated()){
    //IF WE ARE ON THE SAME PAGE THEN WE USE THE RES.RENDER ELSE WE USE THE RES.REDIRECT
    //AS WE CAN SEE HERE WE ARE AGAIN REDIRECTING THEM TO THE SAME PAGE
    res.render("secrets");
  }else {
    res.redirect("/login");
  }
});

// app.get("/logout", function(req, res){
//   req.logout();
//   res.redirect("/");
// });

app.get("/logout", (req, res) => {
  req.logout(req.user, err => {
    if(err) return next(err);
    res.redirect("/");
  });
});

app.post("/register", function(req, res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    } else{
      //here we are Authenticating the user with the information he have added to this, and saving the cookies to the Local browser history
      //It is not only saving the Browser history but also the cookies
      passport.authenticate("local")(req, res, function(){
        //IF EVERYTHING WENTS FINE THEN WE GO TO secrets
        res.redirect("/secrets");
      });
    }
  });
});

app.post("/login", function(req, res) {
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
    //below is the passport package i.e req.login
    req.login(user, function() {
      if(err) {
        console.log(err);
      }else {
        passport.authenticate("local")(req, res, function(){
        res.redirect("secrets");
      });
      }
    });
});

app.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.listen(3000, function(){
  console.log("Port is running on 3000");
});

//copy npm i express body-parser request ejs
//to hyper terminal

//some testing is done

//MOST IMPORTANT WHENEVER THE SERVER IS STARTED AGAIN SO ALL THE COOKIES WHICH ARE SAVED ON THE SERVER "NOT ON THE BROWSER" ARE DELETED AND WE will
//FORCED TO LOGIN BACK
