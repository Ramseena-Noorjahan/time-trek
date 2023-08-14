//import userModel
const userModel = require("../model/userModel");
const Product = require("../model/productModel");
const bcrypt = require("bcrypt");
const Razorpay = require("razorpay");
const Cart = require("../model/cartModel");
const test = require("../model/testModel");
const orderModel = require("../model/orderModel");
const couponModel = require("../model/couponModel");
const bannerModel = require("../model/bannerModel");
const Category = require("../model/categoryModel");
const whishlistModal = require("../model/whishListModal");
const { ObjectId } = require("mongodb");
require("dotenv").config();

//twilio config
// const accountSid = "AC4c0446b84a6e989d7e25352b30088470";
// const authToken = "87b3cd4e0fef8f00d305138ffe7d2f4f";
// const client = require("twilio")(accountSid, authToken, {
  //   lazyLoading: true,
  // });
  
  // const client = require("twilio")(process.env.accountSid, process.env.authToken, {
    //   lazyLoading: true,
    // });
    
    const client = require("twilio")(
      process.env.accountSid,
      process.env.authToken,
      {
        lazyLoading: true,
      }
      );
      
      // Access the environment variables
      const key_id = "rzp_test_CUiyz16ts3sjjL";
      const key_secret = "Oc6oWhAKrkHVV7unGaLSfIzh";
      
      // Create the instance object with the environment variables
      const { AsyncResource } = require("async_hooks");
      var instance = new Razorpay({
        key_id: key_id,
        key_secret: key_secret,
      });
      
      const getRegister = (req, res) => {
        try {
          res.render("register", {
            message: undefined,
            cartitem:undefined,
      whishlistitem:undefined,
      user: req.session.user || undefined,
    });
  } catch (error) {
    console.log(error);
  }
};
const postRegister = async (req, res) => {
  try {
    const userExist = await userModel.findOne({ email: req.body.email });
    if (userExist) {
      res.render("register", {
        message: "User already exist",
        cartitem:undefined,
        whishlistitem:undefined,
        user: req.session.user || undefined,
      });
    } else {
      const hashedPassword = bcrypt.hash(req.body.password, 10);

      const user = new userModel({
        name: req.body.name,
        email: req.body.email,
        number: req.body.number,
        password: await hashedPassword,
        isVerified: false,
      });
      await user.save();
      const phoneNumber = "+91" + req.body.number;
      req.session.email = req.body.email;
      req.session.number = phoneNumber;
      await client.verify.v2
        .services(process.env.servceSid)
        // .services("VAef5766a0f00d71021c9d316c8027a920")
        .verifications.create({
          to: phoneNumber,
          channel: "sms",
        });
      res.render("otp", {
        message: undefined,
        user: req.session.user || undefined,
        cartitem:undefined,
        whishlistitem:undefined,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

//verify otp
const postOtp = async (req, res) => {
  try {
    const otp = req.body.otp;
    const phoneNumber = req.session.number;
    const result = await client.verify.v2
      // .services("VAef5766a0f00d71021c9d316c8027a920")
      .services(process.env.servceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: otp,
      });
    if (result.valid === true) {
      const user = await userModel.findOneAndUpdate(
        { email: req.session.email },
        { isVerified: true }
      );
      res.redirect("/login");
    } else {
      res.render("otp", {
        message: "otp failed",
        cartitem:undefined,
        whishlistitem:undefined,
        user: req.session.user || undefined,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const getLogin = (req, res) => {
  try {
    res.render("login", {
      message: undefined,
      cartitem:undefined,
      whishlistitem:undefined,
      user: req.session.user || undefined,
    });
  } catch (error) {
    console.log(error);
  }
};



const postLogin = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (user) {
      const matchedPassord = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (matchedPassord) {
        if (user.isVerified) {
          req.session.user = user._id;
          res.redirect("/");
        } else {
          res.render("login", {
            message: "not verified",
            user: req.session.user || undefined,
            whishlistitem:undefined,
            cartitem:undefined,
          });
        }
      } else {
        res.render("login", {
          message: "enter password incorrect",
          user: req.session.user || undefined,
          whishlistitem:undefined,
          cartitem:undefined,
        });
      }
    } else {
      res.render("login", {
        message: "enter email incorrect",
        user: req.session.user || undefined,
        whishlistitem:undefined,
        cartitem:undefined,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const gethome = async (req, res) => {
  try {
    const todayDate = new Date();
    const banner = await bannerModel.find();
    const products = await Product.find({ deleted: false });
    const cart = await Cart.findOne({user:req.session.user})
    if(cart){
     var cartitem = cart.product.length

   }
   const whishlist = await whishlistModal.findOne({user:req.session.user})   
   if(whishlist){
    var whishlistitem = whishlist.product.length
   }
    res.render("home", {
      products,
      banner,
      cartitem,
      user: req.session.user || undefined,
      todayDate,
      whishlistitem,
    });
  } catch (error) {
    console.log(error);
  }
};







const getlogout = (req, res) => {
  try {
    req.session.user = null;
    res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
};

const getdetailpage = async (req, res) => {
  try {
    const id = req.query.id;
    const productdata = await Product.findOne({ _id: id });
    const cart = await Cart.findOne({user:req.session.user})
    if(cart){
     var cartitem = cart.product.length

   } const whishlist = await whishlistModal.findOne({user:req.session.user})   
   if(whishlist){
    var whishlistitem = whishlist.product.length
   }
    
    res.render("productdetails", {
      productdata,
      cartitem,
      whishlistitem,
      user: req.session.user || undefined,
    });
  } catch (error) {
    console.log(error);
  }
};

const getuserprofile = async (req, res) => {
  try {
    const user = await userModel.findById(req.session.user);
    const cart = await Cart.findOne({user:req.session.user})
    if(cart){
     var cartitem = cart.product.length

   } const whishlist = await whishlistModal.findOne({user:req.session.user})   
   if(whishlist){
    var whishlistitem = whishlist.product.length
   }
    
    res.render("userProfile", { user, address: user.address,cartitem,whishlistitem});
  } catch (error) {
    console.log(error);
  }
};
const editProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const data = await userModel.findOneAndUpdate(
      { _id: req.session.user },
      { name: name, email, number: phone }
    );
    res.redirect("/userProfile");
  } catch (error) {
    console.log(error);
  }
};

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.session.user });
    const whishlist = await whishlistModal.findOne({user:req.session.user})   
    if(whishlist){
     var whishlistitem = whishlist.product.length
    }
    
    if (cart) {
      const userData = await userModel.findOne({ _id: req.session.user });
      var cartitem = cart.product.length
      const cartData = await Cart.findOne({ user: userData._id }).populate(
        "product.productId"
      );

      if (cartData) {
        let Total;
        if (cartData.product != 0) {
          const total = await Cart.aggregate([
            {
              $match: { user: userData._id },
            },
            {
              $unwind: "$product",
            },
            {
              $project: {
                price: "$product.price",
                quantity: "$product.quantity",
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply: ["$quantity", "$price"],
                  },
                },
              },
            },
          ]).exec();
          Total = total[0].total;

          //pass the data to front
          res.render("cart", {
            user: req.session.user || undefined,
            data: cartData.product,
            userId: userData._id,cartitem,
            total: Total,whishlistitem
          });
        } else {
          res.render("cart", {
            user: req.session.user || undefined,
            data2: "hi",cartitem,whishlistitem
          });
        }
      } else {
        res.render("cart", {
          user: req.session.user || undefined,
          data2: "hi",cartitem,whishlistitem
        });
      }
    } else {
      res.render("cart", {
        user: req.session.user || undefined,
        data2: "hi",cartitem,whishlistitem
      });
    }

    // res.render("cart", { user: req.session.user || undefined });
  } catch (error) {
    console.log(error);
  }
};

const addToCart = async (req, res) => {
  try {
    const productId = req.body.id;
    const todayDate = new Date();
    const userId = req.session.user;
    const productData = await Product.findById(productId);
    const userCart = await Cart.findOne({ user: userId });
    if (userCart) {
      const productExist = userCart.product.findIndex(
        (product) => product.productId == productId
      );
      if (productExist != -1) {
        res.json({ exist: true });
      } else {
        if (
          productData.productOffer > productData.categoryOffer &&
          todayDate <= productData.expiredate &&
          todayDate >= productData.startdate
        ) {
          await Cart.findOneAndUpdate(
            { user: userId },
            {
              $push: {
                product: {
                  productId: productId,
                  price: productData.price- productData.productOffer,
                },
              },
            }
          );
          res.json({ success: true });
        }else if(
          productData.categoryOffer > productData.productOffer 
         
        ){
          await Cart.findOneAndUpdate(
            { user: userId },
            {
              $push: {
                product: {
                  productId: productId,
                  price: productData.price- productData.categoryOffer,
                },
              },
            }
          );
          res.json({ success: true });
        } 
        else {
          await Cart.findOneAndUpdate(
            { user: userId },
            {
              $push: {
                product: { productId: productId, price: productData.price },
              },
            }
          );
          res.json({ success: true });
        }
      }
    } else {
      if (
        productData.productOffer > productData.categoryOffer &&
        todayDate <= productData.expiredate &&
        todayDate >= productData.startdate
      ) {
        const data = new Cart({
          user: userId,
          product: [{ productId: productId, price:productData.price- productData.productOffer }],
        });
        await data.save();
        res.json({ success: true });
      }else if(
        productData.categoryOffer > productData.productOffer 
          
      ){
        const data = new Cart({
          user: userId,
          product: [{ productId: productId, price: productData.price-productData.categoryOffer }],
        });
        await data.save();
        res.json({ success: true });
      }
       else {
        const data = new Cart({
          user: userId,
          product: [{ productId: productId, price:productData.price }],
        });
        await data.save();
        res.json({ success: true });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const changeQuantity = async (req, res, next) => {
  try {
    const userId = req.body.user;
    const productId = req.body.product;
    const count = parseInt(req.body.count);
    const cartData = await Cart.findOne(
      { user: userId, "product.productId": productId },
      { "product.productId.$": 1, "product.quantity": 1 }
    );

    const [{ quantity: quantity }] = cartData.product;

    const stockAvailable = await Product.findById(productId);

    // Quantity doesn't increse when stock not available
    if (stockAvailable.stock < quantity + count) {
      res.json({ changeSuccess: false });
    } else {
      await Cart.updateOne(
        { user: userId, "product.productId": productId },
        { $inc: { "product.$.quantity": count } }
      );
      res.json({ changeSuccess: true });
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/505");
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const id = req.body.id;

    await Cart.findOneAndUpdate(
      { "product.productId": id },
      { $pull: { product: { productId: id } } }
    );
    res.json({ success: true });
  } catch (error) {
    console.log(error);
  }
};

const getcheckout = async (req, res) => {

  try {
    const coupon = await couponModel.find()
    
    const userData = await userModel.findOne({ _id: req.session.user });

    const cartData = await Cart.findOne({ user: userData._id }).populate(
      "product.productId"
    );
    const cart = await Cart.findOne({user:req.session.user})
    if(cart){
     var cartitem = cart.product.length

   }
   const whishlist = await whishlistModal.findOne({user:req.session.user})   
   if(whishlist){
    var whishlistitem = whishlist.product.length
   }
    let Total;
    if (cartData.product != 0) {
      const total = await Cart.aggregate([
        {
          $match: { user: userData._id },
        },
        {
          $unwind: "$product",
        },
        {
          $project: {
            price: "$product.price",
            quantity: "$product.quantity",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $multiply: ["$quantity", "$price"],
              },
            },
          },
        },
      ]).exec();

      Total = total[0].total;

      //pass the data to front

      const data = await userModel.findOne({
        _id: req.session.user,
      });

      res.render("checkout", {
        address: data.address || undefined,
        total: Total,
        wallet: data.wallet,
        cartitem,
        whishlistitem,
        user: req.session.user || undefined,
        coupon
      });
    }
  } catch (error) {
    console.log(error);
  }
};



const postAddAddress = async (req, res) => {
  try {
    const { name, country, town, street, postcode, phone } = req.body;

    await userModel.updateOne(
      { _id: req.session.user },
      {
        $push: {
          address: {
            name: name,
            country: country,
            town: town,
            street: street,
            postcode: postcode,
            phone: phone,
          },
        },
      }
    );
    res.redirect("/userProfile");
  } catch (error) {
    console.log(error);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const id = req.query.id;
    await userModel.updateOne(
      { _id: req.session.user },
      {
        $pull: {
          address: {
            _id: id,
          },
        },
      }
    );
    res.redirect("/checkout");
  } catch (error) {
    console.log(error);
  }
};

const placeOrder = async (req, res) => {
  try {
    const { total, address, payment, wallet, totalBefore } = req.body;
    const user = await userModel.findOne({
      _id: req.session.user,
    });
    if (address === null) {
      res.json({ codFailed: true });
    }
    const cartData = await Cart.findOne({ user: user._id });
    const product = cartData.product;

    const status = payment == "cod" ? "placed" : "pending";

    const orderNew = new orderModel({
      deliveryDetails: address,
      totalAmount: total,
      status: status,
      user: user._id,
      paymentMethod: payment,
      product: product,
      wallet: wallet,
      totalBefore: totalBefore,
      discount: 0,
      Date: new Date(),
      couponCode: "",
    });

    await orderNew.save();
    let orderId = orderNew._id;

    await userModel.findByIdAndUpdate(user._id, {
      wallet: 0,
    });

    if (status == "placed") {
      const couponData = await couponModel.findById(req.session.couponId);

      console.log(couponData);
      if (couponData) {
        console.log("if");
        let newLimit = couponData.limit - 1;
        await couponModel.findByIdAndUpdate(couponData._id, {
          limit: newLimit,
        });
        await orderModel.findByIdAndUpdate(orderId, {
          couponCode: couponData.couponcode,
          discount: couponData.couponamount,
        });
      }
      await Cart.deleteOne({ user: user._id });
      for (i = 0; i < product.length; i++) {
        const productId = product[i].productId;
        const quantity = Number(product[i].quantity);
        await Product.findByIdAndUpdate(productId, {
          $inc: { stock: -quantity },
        });
      }
      res.json({ codSuccess: true });
    } else {
      var options = {
        amount: total * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          res.json({ order });
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const getOrderSuccess = async (req, res) => {
  try {
    const cart = await Cart.findOne({user:req.session.user})
    if(cart){
     var cartitem = cart.product.length

   } const whishlist = await whishlistModal.findOne({user:req.session.user})   
   if(whishlist){
    var whishlistitem = whishlist.product.length
   }
    res.render("orderSuccess", { user: req.session.user || undefined ,cartitem,whishlistitem});
  } catch (error) {
    console.log(error);
  }
};

const getOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({user:req.session.user})
    if(cart){
     var cartitem = cart.product.length

   } const whishlist = await whishlistModal.findOne({user:req.session.user})   
   if(whishlist){
    var whishlistitem = whishlist.product.length
   }
    let userData = await userModel.findOne({ _id: req.session.user });
    const orderData = await orderModel.find({ user: userData._id });
    const today = new Date()
    res.render("orders", {
      user: req.session.user || undefined,
      data: orderData,
      cartitem,
      today,
      whishlistitem,
    });
  } catch (error) {
    console.log(error);
  }
};

const getSingleOrder = async (req, res) => {
  try {
    const id = req.query.id;

    const orderData = await orderModel
      .findById(id)
      .populate("product.productId");
      const cart = await Cart.findOne({user:req.session.user})
    if(cart){
     var cartitem = cart.product.length

   } const whishlist = await whishlistModal.findOne({user:req.session.user})   
   if(whishlist){
    var whishlistitem = whishlist.product.length
   }

    res.render("singleOrder", {
      data: orderData.product,
      orderData,
      cartitem,
      whishlistitem,
      user: req.session.user || undefined,
    });
  } catch (error) {
    console.log(error);
  }
};

const returnOrder = async (req, res) => {
  try {
    const id = req.query.id;
    const reason = req.body.reason

    const orderDataa = await orderModel.findByIdAndUpdate(id, {
      status: "returned",
      wallet: 0,
      reason:reason
    });

    if (orderDataa.paymentMethod == "COD") {
      const total = orderDataa.wallet;
      await userModel.findByIdAndUpdate(orderDataa.user, {
        $inc: { wallet: total },
      });
    } else {
      const total = orderDataa.totalAmount + orderDataa.wallet;
      const test = await userModel.findByIdAndUpdate(orderDataa.user, {
        $inc: { wallet: total },
      });
    }

    if (orderDataa) {
      res.redirect("/orders");
    }
  } catch (error) {
    console.log(error);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.query.id;
    const orderData = await orderModel.findById(orderId);
    const wallet = orderData.wallet;
    const total = orderData.totalAmount + wallet;
    const reason = req.body.reason

    await orderModel.findByIdAndUpdate(orderId, {
      $set: { status: "cancelled" ,reason: reason},
    });

    if (orderData.paymentMethod == "COD") {
      await userModel.findByIdAndUpdate(orderData.user, {
        $inc: { wallet: wallet },
      });
    } else {
      await userModel.findByIdAndUpdate(orderData.user, {
        $inc: { wallet: total },
      });
    }

    for (i = 0; i < orderData.product.length; i++) {
      // const [{productId : productId, quantity : quantity}] = product
      const productId = orderData.product[i].productId;
      const quantity = orderData.product[i].quantity;
      await Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } });
    }

    res.redirect("/orders");
  } catch (error) {
    console.log(error);
  }
};

const applycoupon = async (req, res) => {
  try {
    let code = req.body.code;
    let amount = req.body.amount;
    let userData = await userModel.find({ _id: req.session.user });
    let userexist = await couponModel.findOne({
      couponcode: code,
      used: { $in: [userData._id] },
    });
    if (userexist) {
      res.json({ user: true });
    } else {
      const couponData = await couponModel.findOne({ couponcode: code });
      if (couponData) {
        if (couponData.expiredate >= new Date()) {
          if (couponData.limit != 0) {
            if (couponData.mincartamount <= amount) {
              let discountvalue = couponData.couponamount;

              let distotal = Math.round(amount - discountvalue);
              let couponId = couponData._id;
              req.session.couponId = couponId;

              return res.json({
                couponokey: true,

                distotal,
                discountvalue,
                code,
              });
            } else {
              res.json({ cartamount: true });
            }
          } else {
            res.json({ limit: true });
          }
        } else {
          res.json({ expire: true });
        }
      } else {
        res.json({ invalid: true });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const verifyPayment = async (req, res) => {
  try {
    let userData = await userModel.findOne({ _id: req.session.user });
    const cartData = await Cart.findOne({ user: userData._id });
    const product = cartData.product;

    const details = req.body;
    const crypto = require("crypto");
    let hmac1 = crypto.createHmac("sha256", "Oc6oWhAKrkHVV7unGaLSfIzh");
    hmac1.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );
    hmac1 = hmac1.digest("hex");

    if (hmac1 == details.payment.razorpay_signature) {
      let orderReceipt = details.order.receipt;
      let test1 = await orderModel.findByIdAndUpdate(
        {
          _id: new ObjectId(orderReceipt),
        },
        { $set: { paymentId: details.payment.razorpay_payment_id } }
      );
      let test2 = await orderModel.findByIdAndUpdate(orderReceipt, {
        $set: { status: "placed" },
      });
      await Cart.deleteOne({ user: userData._id });

      for (i = 0; i < product.length; i++) {
        const productId = product[i].productId;
        const quantity = Number(product[i].quantity);
        await Product.findByIdAndUpdate(productId, {
          $inc: { stock: -quantity },
        });
      }

      res.json({ success: true });
    } else {
      await orderModel.deleteOne({ _id: details.order.receipt });
      res.json({ onlineSuccess: true });
    }
  } catch (error) {
    console.log(error);
  }
};

const getShop = async (req, res) => {
  try {
    const cart = await Cart.findOne({user:req.session.user})
    if(cart){
     var cartitem = cart.product.length

   }const whishlist = await whishlistModal.findOne({user:req.session.user})   
   if(whishlist){
    var whishlistitem = whishlist.product.length
   }
    const todayDate = new Date();

    const page = Number(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    let Search = req.query.search || "";
    Search = Search.trim();

    let category = req.query.category || "ALL";
    let cat = [];
    const catData = await Category.find();
    for (let i = 0; i < catData.length; i++) {
      cat[i] = catData[i].name;
    }
    category === "ALL"
      ? (category = [...cat])
      : (category = req.query.category.split(","));

    const productData = await Product.aggregate([
      {
        $match: {
          productname: { $regex: "^" + Search, $options: "i" },
          category: { $in: category },
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);
    const productCount = (
      await Product.find({
        productname: { $regex: "^" + Search, $options: "i" },
      })
        .where("category")
        .in([...category])
    ).length;

    const pageCount = Math.ceil(productCount / limit);

    res.render("shop", {
      products: productData,
      pageCount,
      page,
      category,
      Search,
      user: req.session.user || undefined,
      todayDate,
      cartitem,
      whishlistitem
    });
  } catch (error) {
    console.log(error.message);
  }
};

const checkWallet = async (req, res) => {
  try {
   

    const userData = await userModel.findOne({ _id: req.session.user });
    const walleta = userData.wallet;
    if (walleta > 0) {
      console.log("server send");
      res.json({ success: true, walleta });
    }
  } catch (error) {
    console.log(error);
  }
};

const getWhishlist = async (req, res) => {
  try {
    const cart = await Cart.findOne({user:req.session.user})
    if(cart){
     var cartitem = cart.product.length

   }
    const whishlist = await whishlistModal.findOne({ user: req.session.user });
    if (whishlist) {
      const userData = await userModel.findOne({ _id: req.session.user });
     var whishlistitem = whishlist.product.length
      const whishlistData = await whishlistModal
        .findOne({ user: userData._id })
        .populate("product.productId");

      if (whishlistData) {
        // let Total;
        if (whishlistData.product != 0) {
          //
          //pass the data to front
          res.render("whishlist", {
            user: req.session.user || undefined,
            data: whishlistData.product,
            cartitem,whishlistitem
            // userId: userData._id,
            // total: Total,
          });
        } else {
          res.render("whishlist", {
            user: req.session.user || undefined,
            data2: "hi",
            cartitem,whishlistitem

          });
        }
      } else {
        res.render("whishlist", {
          user: req.session.user || undefined,
          data2: "hi",
          cartitem,whishlistitem
        });
      }
    } else {
      res.render("whishlist", {
        user: req.session.user || undefined,
        data2: "hi",
        cartitem,whishlistitem
      });
    }

    // res.render("cart", { user: req.session.user || undefined });
  } catch (error) {
    console.log(error);
  }
};

const addWhishlist = async (req, res) => {
  try {
    const productId = req.body.id;
    const userId = req.session.user;
    const productData = await Product.findById(productId);
    const alreadyWishlist = await whishlistModal.findOne({ user: userId });
    if (alreadyWishlist) {
      const productExist = await alreadyWishlist.product.findIndex(
        (product) => product.productId == productId
      );
      if (productExist != -1) {
        res.json({ exist: true });
      } else {
        await whishlistModal.findOneAndUpdate(
          { user: userId },
          {
            $push: {
              product: {
                productId: productId,
                name: productData.name,
                price: productData.price,
              },
            },
          }
        );
        res.json({ success: true });
      }
    } else {
      const data = new whishlistModal({
        user: userId,
        product: [
          {
            productId: productId,
            name: productData.productname,
            price: productData.price,
          },
        ],
      });
      await data.save();
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error);
  }
};

const addToCartWishlist = async (req, res) => {
  try {
    const productId = req.body.id;
    const userId = req.session.user;
    const productData = await Product.findById(productId);
    const userCart = await Cart.findOne({ user: userId });

    if (userCart) {
      const productExist = await userCart.product.findIndex(
        (product) => product.productId == productId
      );
      if (productExist != -1) {
        const cartData = await Cart.findOne(
          { user: userId, "product.productId": productId },
          { "product.productId.$": 1, "product.quantity": 1 }
        );

        const [{ quantity: quantity }] = cartData.product;

        if (productData.stock <= quantity) {
          res.json({ outofstock: true });
        } else {
          await Cart.findOneAndUpdate(
            { user: userId, "product.productId": productId },
            { $inc: { "product.$.quantity": 1 } }
          );
          await whishlistModal.findOneAndUpdate(
            { "product.productId": productId },
            { $pull: { product: { productId: productId } } }
          );
          res.json({ success: true });
        }
      } else {
        if (productData.stock <= 0) {
          res.json({ outofstock: true });
        } else {
          await Cart.findOneAndUpdate(
            { user: userId },
            {
              $push: {
                product: { productId: productId, price: productData.price },
              },
            }
          );
          await whishlistModal.findOneAndUpdate(
            { "product.productId": productId },
            { $pull: { product: { productId: productId } } }
          );
          res.json({ success: true });
        }
      }
    } else {
      if (productData.stock <= 0) {
        res.json({ outofstock: true });
      } else {
        const data = new Cart({
          user: userId,
          product: [{ productId: productId, price: productData.price }],
        });
        const result = await data.save();
        await whishlistModal.findOneAndUpdate(
          { "product.productId": productId },
          { $pull: { product: { productId: productId } } }
        );
        if (result) {
          res.json({ success: true });
        }
      }
    }
  } catch (error) {
    res.redirect("/serverERR", { message: error.message });
    console.log(error.message);
  }
};


const salesReport = async (req,res) => {
  try {
    let start
    let end  

    req.query.start ? (start = new Date(req.query.start)) : (start = "ALL");
    req.query.end ? (end = new Date(req.query.end)) : (end = "ALL");


    if(start != "ALL" && end != "ALL"){
      const data = await orderModel.aggregate([
          {
              $match : {
                  $and : [{Date : {$gte : start}},{Date : {$lte : end}},{ status: { $eq: "Delivered" } }]
              }
          }
      ])
      let SubTotal = 0;
    data.forEach(function (value) {
      SubTotal = SubTotal + value.totalAmount;
    });
      res.render('admin/sales-report', {data , total: SubTotal})
  }else{
    const orderData = await orderModel.find({ status: { $eq: "Delivered" } });
    let SubTotal = 0;
    orderData.forEach(function (value) {
      SubTotal = SubTotal + value.totalAmount;
    });
    res.render("admin/sales-report", { data: orderData, total: SubTotal });
  }

  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  getRegister,
  getLogin,
  postRegister,
  postLogin,
  postOtp,
  gethome,
  getlogout,
  getdetailpage,
  getuserprofile,
  getCart,
  addToCart,
  changeQuantity,
  deleteCartItem,
  getcheckout,
  
  postAddAddress,
  deleteAddress,
  placeOrder,
  getOrderSuccess,
  getOrder,
  getSingleOrder,
  returnOrder,
  cancelOrder,
  editProfile,
  applycoupon,
  verifyPayment,
  getShop,
  checkWallet,
  getWhishlist,
  addWhishlist,
  addToCartWishlist,
  salesReport
};
