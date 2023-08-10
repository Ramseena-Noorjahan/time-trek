const mongoose  = require('mongoose');
const ObjectId=mongoose.Types.ObjectId

const usersSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {  
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    number: {
        type: String,
        required: true,
    },
    isVerified: {
        type:Boolean,
        required: true
    },
    address: [
        {
            name: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
                required: true,
            },
            country: {
                type: String,  
                required: true,
            },
            town: {
                type: String,
                required: true,
            },
            street: {
                type: String,
                required: true,
            },
            postcode: {
                type: String,
                required: true,
            }
        }
    ],
    wallet: {
        type: Number,
        default: 0
    }

})

module.exports = mongoose.model("user",usersSchema)

