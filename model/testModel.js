const mongoose  = require('mongoose');


const testSchema = new mongoose.Schema({
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
})

const test = mongoose.model("test",testSchema)
module.exports=test