//jshint esversion:6
import "dotenv/config"
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from 'mongoose';
// import encrypt from 'mongoose-encryption'
import md5 from "md5"



const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000;

mongoose.connect("mongodb://localhost:27017/userDB")

const userSchema=new mongoose.Schema({
    username: String,
    password: String
})

// userSchema.plugin(encrypt, {secret: process.env.SECRET_KEY, encryptedFields: ['password']});

const User=mongoose.model("User", userSchema);

app.get("/", (req, res)=>{
    res.render("home")
})

app.get("/login", (req, res)=>{
    res.render("login")
})

app.post("/login", async (req, res)=>{
    const username=req.body.username
    const foundUser=await User.findOne({username: username});
    // console.log(foundUser);
    if(foundUser){
        if(foundUser.password==md5(req.body.password)){
            res.render("secrets");
        }
        else{
            res.redirect("/login");
        }
    }
    else{
        res.redirect("/login");
    }
})

app.get("/register", (req, res)=>{
    res.render("register")
})

app.post("/register", (req, res)=>{
    const username=req.body.username
    const password=req.body.password
    const newUser=new User({
        username: username,
        password: md5(password)
    })
    newUser.save();
    res.render("secrets");

})

app.get("/logout", (req, res)=>{
    res.redirect("/");
})

app.listen(port, ()=>{
    console.log(`Server started at Port ${port}`);
})