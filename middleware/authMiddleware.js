const userModel=require("../model/userModel")
const notLogged = (req,res,next) =>{
    try {
        if(req.session.user){
            res.redirect('/')
        }
        else{
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}

const logged = async(req,res,next) =>{
    try {
        
    
        if(req.session.user){
            const user=await userModel.findById(req.session.user)
            if(user.isVerified){
                next()
            }
            else{
                res.redirect('/login')
            }
        }else{
            res.redirect('/login')
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={
    logged,
    notLogged,
}