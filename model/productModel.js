const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productname: {
    type: String,
    required: true,
  },
  image: {
    type: Array,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  deleted: {
    type: Boolean,
    default: true,
  },
  productOffer: {
    type: Number,
    default: 0,
  },

  categoryOffer: {
    type: Number,
    default: 0,
  },
  expiredate: {
    type: Date,
  },
  startdate: {
    type: Date,
  },
});

module.exports = mongoose.model("product", productSchema);
