const { Template } = require("ejs")
const express=require("express")
//const path=("path")
const app=express()
const path=require("path")
require("dotenv").config({path:__dirname + '/'.env})



const session  = require('express-session')


//session handle
app.use(session({secret:'ramseena',saveUninitialized:true,resave:false,cookie:({maxAge:120000000})}))

app.use((req,res,next)=>{
 res.set('Cache-control','no-store,no-cache')
    next()
})


app.use(express.static(__dirname+'/public'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.set("view engine","ejs")




//mongoos connection
const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://Hufako:KhimLMVeRYzJVgBP@cluster0.2cjh3iw.mongodb.net/timetrek").then(()=>{
    console.log("Connected to MongoDB");
}).catch(err=>console.log(err))


//to render user side
const userRoute=require("./route/userRoute")
app.use("/",userRoute)

//to render admin side
const adminRoute=require("./route/adminRoute") 
app.use("/admin",adminRoute)







 





app.listen(3000,()=>{
    console.log("server created")
})
