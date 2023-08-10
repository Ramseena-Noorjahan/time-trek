const mongoose = require('mongoose')



const couponSchema=new mongoose.Schema({
    couponcode:{
        type:String,
        required:true
    },
    couponamount:{
        type:Number,
        required:true,
    },
    mincartamount:{
        type:Number,
        required:true

    },
    expiredate:{
        type:Date
    },
    used:{
        type:Array
    },
    status:{
        type:Boolean,
        default:true
    },
    limit:{
        type:Number,
        required:true
    }
     

},{
    timestamps:true
})


module.exports = mongoose.model("coupon",couponSchema)