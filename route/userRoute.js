const express = require("express");
const userRoute = express();
const userCotroller = require("../controller/user_Controller");
const authMiddleware = require("../middleware/authMiddleware");
const { isblocked } = require("../middleware/isblocked");
const userModel = require("../model/userModel");

//register
userRoute.get("/register", authMiddleware.notLogged, userCotroller.getRegister);
userRoute.post("/register", userCotroller.postRegister);

//verify otp
userRoute.post("/otp", userCotroller.postOtp);

//login
userRoute.get("/login", authMiddleware.notLogged, userCotroller.getLogin);
userRoute.post("/login", userCotroller.postLogin);

//home
userRoute.get("/", isblocked, userCotroller.gethome);

//logout
userRoute.get("/logout", userCotroller.getlogout);

//productdetails
userRoute.get("/product_details", userCotroller.getdetailpage);

//userprofile
userRoute.get(
  "/userProfile",
  authMiddleware.logged,
  userCotroller.getuserprofile
);

//shopcart
userRoute.get("/cart", authMiddleware.logged, userCotroller.getCart);

//addToCart
userRoute.post("/addtoCart", authMiddleware.logged, userCotroller.addToCart);

//changeQty
userRoute.post(
  "/change-product-quantity",
  authMiddleware.logged,
  userCotroller.changeQuantity
);

//delete cart item
userRoute.post(
  "/delete-cart-item",
  authMiddleware.logged,
  userCotroller.deleteCartItem
);

//checkOut
userRoute.get("/checkout", authMiddleware.logged, userCotroller.getcheckout);

// //getform
// userRoute.get("/test", userCotroller.getform);
// userRoute.post("/test", userCotroller.postform);

//addaddress
userRoute.post(
  "/addAddress",
  authMiddleware.logged,
  userCotroller.postAddAddress
);

//deleteAddress
userRoute.get(
  "/delete-address",
  authMiddleware.logged,
  userCotroller.deleteAddress
);

//placeOrder
userRoute.post("/place-order", authMiddleware.logged, userCotroller.placeOrder);

//ordersuccess
userRoute.get("/order-placed", userCotroller.getOrderSuccess);

//get order page
userRoute.get("/orders", authMiddleware.logged, userCotroller.getOrder);

//get single order page
userRoute.get(
  "/singleOrder",
  authMiddleware.logged,
  userCotroller.getSingleOrder
);

//return order
userRoute.get("/returnOrder", authMiddleware.logged, userCotroller.returnOrder);

//cancel order
userRoute.get("/cancelOrder", authMiddleware.logged, userCotroller.cancelOrder);

//editProfile
userRoute.post(
  "/editprofile",
  authMiddleware.logged,
  userCotroller.editProfile
);

//apply coupon
userRoute.post(
  "/applycoupon",
  authMiddleware.logged,
  userCotroller.applycoupon
);

//verify razorpay payment
userRoute.post(
  "/verifyPayment",
  authMiddleware.logged,
  userCotroller.verifyPayment
);

userRoute.get("/getShop", userCotroller.getShop);
userRoute.post("/getShop", userCotroller.getShop);

//wallet
userRoute.post(
  "/checkWallet",
  authMiddleware.logged,
  userCotroller.checkWallet
);

//whishlist
userRoute.get("/Whishlist", authMiddleware.logged, userCotroller.getWhishlist);
userRoute.post(
  "/addtoWishlists",
  authMiddleware.logged,
  userCotroller.addWhishlist
);
userRoute.post(
  "/add-to-cart-wishlist",
  authMiddleware.logged,
  userCotroller.addToCartWishlist
);

//salesReport
userRoute.get("/salesReport",userCotroller.salesReport)

module.exports = userRoute;
