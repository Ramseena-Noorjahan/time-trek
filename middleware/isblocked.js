const userModel=require("../model/userModel")
const productModel = require("../model/productModel")
const isblocked=async (req,res,next)=>{
  try {
    if(req.session.user){
        const id=req.session.user
       const user= await userModel.findById(id)
       const products = await productModel.find()
       if(user.isVerified==false){
        req.session.user =null
          res.render("home",{products,user:false})
       }else{
        next()
       }
    }else{
        next()
    }
  } catch (error) {
    console.log(error);
  }
}
module.exports={
    isblocked
}