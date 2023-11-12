//jshint esversion:6
import "dotenv/config"
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose, { sanitizeFilter } from 'mongoose';
// import encrypt from 'mongoose-encryption'
// import md5 from "md5"
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";


const saltRounds=10;
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000;

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB")

const userSchema=new mongoose.Schema({
    username: String,
    password: String
})

userSchema.plugin(passportLocalMongoose)
// userSchema.plugin(encrypt, {secret: process.env.SECRET_KEY, encryptedFields: ['password']});

const User=mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res)=>{
    res.render("home")
})

app.get("/login", (req, res)=>{
    res.render("login")
})

app.post("/login", async (req, res)=>{
    const username=req.body.username
    const password=req.body.password
    const newUser=new User({
        username: username,
        password: password
    });
    req.login(newUser, (err)=>{
        if(err){
            console.log(err);
            res.redirect("/login");
        }
        else{
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/secrets");
            })
        }
    })
})

app.get("/register", (req, res)=>{
    res.render("register")
})

app.post("/register", (req, res)=>{
    const username=req.body.username
    const password=req.body.password
    User.register({username: username}, password, (err, newUser)=>{
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/secrets");
            })
        }
    });
})

app.get("/logout", (req, res)=>{
    req.logout((err)=>{
        if(err){
            console.log(err);
        }
    });
    res.redirect("/");
})

app.get("/secrets", (req, res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
})

app.listen(port, ()=>{
    console.log(`Server started at Port ${port}`);
})