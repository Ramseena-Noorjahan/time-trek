const userModel = require("../model/userModel");
const Category = require("../model/categoryModel");
const Product = require("../model/productModel");
const orderModel = require("../model/orderModel");
const bannerModel = require("../model/bannerModel");
const couponModel = require("../model/couponModel");
const puppeteer = require("puppeteer");
const path = require("path");

const { logged } = require("../middleware/adminAuthmMiddleware");

const { ObjectId } = require("mongodb");

const getLogin = (req, res) => {
  try {
    res.render("admin/login", { message: undefined });
  } catch (error) {
    console.log(error);
  }
};

const postLogin = (req, res) => {
  try {
    const adminEmail = "admin@gmail.com";
    const adminPassword = 12345678;

    if (req.body.email == adminEmail && req.body.password == adminPassword) {
      req.session.login = true;
      res.redirect("/admin/");
    } else {
      res.render("admin/login", { message: "invalid credentials" });
    }
  } catch (error) {
    console.log(error);
  }
};

const getAdminHome = async (req, res) => {
  // try {
  //   res.render("admin/adminhome");
  // } catch (error) {
  //   console.log(error);
  // }
  try {
    const orderData = await orderModel.find({ status: { $eq: "Delivered" } });
    let SubTotal = 0;
    orderData.forEach(function (value) {
      SubTotal = SubTotal + value.totalAmount;
    });

    const cod = await orderModel.find({ paymentMethod: "cod" }).count();
    const online = await orderModel.find({ paymentMethod: "online" }).count();
    const totalOrder = await orderModel
      .find({ status: { $ne: "cancelled" } })
      .count();
    const totalUser = await userModel.find().count();
    const totalProducts = await Product.find().count();

    const date = new Date();
    const year = date.getFullYear();
    const currentYear = new Date(year, 0, 1);

    const salesByYear = await orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: currentYear },
          status: { $eq: "Delivered" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%m", date: "$createdAt" } },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    let sales = [];
    for (i = 1; i < 13; i++) {
      let result = true;
      for (j = 0; j < salesByYear.length; j++) {
        result = false;
        if (salesByYear[j]._id == i) {
          sales.push(salesByYear[j]);
          break;
        } else {
          result = true;
        }
      }
      if (result) {
        sales.push({ _id: i, total: 0, count: 0 });
      }
    }

    let yearChart = [];
    for (i = 0; i < sales.length; i++) {
      yearChart.push(sales[i].total);
    }

    res.render("admin/adminhome", {
      data: orderData,
      total: SubTotal,
      cod,
      online,
      totalOrder,
      totalUser,
      totalProducts,
      yearChart,
    });
  } catch (error) {
    console.log(error);
  }
};

const getLogout = (req, res) => {
  try {
    req.session.login = null;
    res.redirect("/admin/login");
  } catch (error) {
    console.log(error);
  }
};

const getUserManagement = async (req, res) => {
  try {
    const user = await userModel.find();
    res.render("admin/usermanagement", { user });
  } catch (error) {
    console.log(error);
  }
};

const getBlockUnblock = async (req, res) => {
  try {
    const user = await userModel.findById(req.query.id);
    if (user.isVerified) {
      await userModel.findByIdAndUpdate(req.query.id, { isVerified: false });
    } else {
      await userModel.findByIdAndUpdate(req.query.id, { isVerified: true });
    }
    res.redirect("/admin/user_management");
  } catch (error) {
    console.log(error);
  }
};

const getproductManagement = async (req, res) => {
  try {
    const products = await Product.find();
    res.render("admin/products", { products });
  } catch (error) {
    console.log(error);
  }
};

const getcategorymanagement = async (req, res) => {
  try {
    const data = await Category.find();
    res.render("admin/category", { data });
  } catch (error) {
    console.log(error);
  }
};

const getaddCategory = (req, res) => {
  try {
    res.render("admin/addcategory");
  } catch (error) {
    console.log(error);
  }
};

const postaddCategory = async (req, res) => {
  try {
    const Name = req.body.name;
    const data = await Category.findOne({
      name: { $regex: Name, $options: "i" },
    });
    if (data) {
      res.render("admin/addcategory", {
        message: "category is already defined",
      });
    } else {
      const data1 = await new Category({
        name: Name,
      });
      const result = await data1.save();
      if (result) {
        res.redirect("/admin/category");
      } else {
        res.render("admin/addcategory", {
          message: "ERror while adding to then database",
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const getaddproducts = async (req, res) => {
  try {
    const category = await Category.find();
    res.render("admin/addproducts", { category });
  } catch (error) {
    console.log(error);
  }
};

const postAddProduct = async (req, res) => {
  try {
    const name = req.body.name;
    const price = req.body.price;
    const stock = req.body.stock;
    const category = req.body.category;
    const description = req.body.description;
    const offerprice = req.body.offerprice;
    const expiredate = req.body.expiry;
    const startdate = req.body.start;

    const image = [];
    for (i = 0; i < req.files.length; i++) {
      image[i] = req.files[i].filename;
    }

    const data = new Product({
      productname: name,
      image: image,
      description: description,
      category: category,
      price: price,
      stock: stock,
      deleted: false,
      productOffer: offerprice,
      expiredate: expiredate,
      startdate: startdate,
    });

    const result = await data.save();
    if (result) {
      res.redirect("/admin/products");
    }
  } catch (error) {
    console.log(error);
  }
};

const deleteProductById = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findOne({ _id: id });
    if (productData.deleted === true) {
      const data = await Product.findByIdAndUpdate(id, { deleted: false });
      if (data) {
        res.redirect("/admin/products");
      }
    } else {
      const data = await Product.findByIdAndUpdate(id, { deleted: true });
      if (data) {
        res.redirect("/admin/products");
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const getEditProduct = async (req, res) => {
  try {
    const category = await Category.find();
    const id = req.query.id;
    const product = await Product.findById({ _id: id });
    res.render("admin/editProduct", { product: product, category: category });
  } catch (error) {
    console.log(error);
  }
};

const getOrder = async (req, res) => {
  try {
    const orderData = await orderModel.find();
    const totalData = await orderModel.find({ status: "Delivered" });
    let SubTotal = 0;
    totalData.forEach(function (value) {
      SubTotal = SubTotal + value.totalAmount;
    });
    res.render("admin/order", { data: orderData, total: SubTotal });
  } catch (error) {
    console.log(error);
  }
};

const viewSingleOrder = async (req, res) => {
  try {
    const orderId = req.query.id;

    const orderData = await orderModel
      .findById(orderId)
      .populate("product.productId");

    const userId = orderData.user;
    const userData = await userModel.findById(userId);

    res.render("admin/singleOrder", { orderData, userData });
  } catch (error) {
    console.log(error);
  }
};

const updateStatus = async (req, res) => {
  try {
    const status = req.body.status;
    const orderId = req.body.orderId;
    await orderModel.findByIdAndUpdate(orderId, { status: status });
    res.redirect("/admin/orders");
  } catch (error) {
    console.log(error);
  }
};

const deleteSingle = async (req, res) => {
  try {
    const position = req.body.position;
    const id = new ObjectId(req.body.id);
    const productImage = await Product.findById(id);

    const image = productImage.image[position];
    const data = await Product.updateOne(
      { _id: id },
      {
        $pullAll: {
          image: [image],
        },
      }
    );

    if (data) {
      res.json({ success: true });
    }
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
    res.render("user/505");
  }
};

const updateProduct = async (req, res) => {
  try {
    const name = req.body.name;
    const price = req.body.price;
    const stock = req.body.stock;
    const category = req.body.category;
    const productOffer = req.body.offerprice;
    const expiredate = req.body.expiry;
    const startdate = req.body.start;

    const description = req.body.description;
    const id = req.body.id;

    const image = [];
    for (i = 0; i < req.files.length; i++) {
      image[i] = req.files[i].filename;
    }

    if (image.length != 0) {
      await Product.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            productname: name,
            price: price,
            stock: stock,
            category: category,
            description: description,
            image: image,
            productOffer: productOffer,
            expiredate: expiredate,
            startdate: startdate,
          },
        }
      );
    } else {
      await Product.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            productname: name,
            price: price,
            stock: stock,
            category: category,
            description: description,
            productOffer: productOffer,
            expiredate: expiredate,
            startdate: startdate,
          },
        }
      );
    }
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
    // res.render("user/505");
  }
};

const getBanner = async (req, res) => {
  try {
    const bannerData = await bannerModel.find();
    res.render("admin/banner", { data: bannerData });
  } catch (error) {
    console.log(error.message);
    // res.render('user/505');
  }
};

const getAddBanner = async (req, res) => {
  try {
    res.render("admin/addbanner");
  } catch (error) {
    console.log(error.message);
    //res.render('user/505');
  }
};

const postAddBanner = async (req, res) => {
  try {
    const heading = req.body.heading;
    const discription = req.body.description;
    const image = req.file.filename;

    const data = new bannerModel({
      heading: heading,
      discription: discription,
      image: image,
    });

    const result = await data.save();
    if (result) {
      res.redirect("/admin/banner");
    }
  } catch (error) {
    console.log(error);
  }
};

//getCoupon
const getCoupon = async (req, res) => {
  try {
    const coupon = await couponModel.find();
    res.render("admin/coupon", { data: coupon });
  } catch (error) {
    console.log(error);
  }
};
//getAddCoupon
const getAddCoupon = async (req, res) => {
  try {
    res.render("admin/addcoupon");
  } catch (error) {
    console.log(error);
  }
};
//postAddCoupon
const postAddCoupon = async (req, res) => {
  try {
    let coupons = new couponModel({
      couponcode: req.body.name,
      couponamounttype: req.body.coupontype,
      couponamount: req.body.amount,
      mincartamount: req.body.mincart,
      maxredeemamount: req.body.maxredeem,
      expiredate: req.body.date,
      limit: req.body.limit,
    });
    await coupons.save();
    res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error);
  }
};

const offerPrice = async (req, res) => {
  try {
    const category = await Category.find();
    res.render("admin/offerprice", { category });
  } catch (error) {
    console.log(error);
  }
};

const postOfferPrice = async (req, res) => {
  try {
    const category = req.body.category;
    const offerPrice = req.body.offerprice;
    const data = await Product.updateMany(
      { category: category },
      {
        categoryOffer: offerPrice,
      }
    );
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

const getSalesReport = (req, res) => {
  try {
    // Create a new Date object
    let currentDate = new Date();

    // Get the year, month, and day components from the Date object
    let year = currentDate.getFullYear();
    let month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Months are 0-based, so we add 1
    let day = ("0" + currentDate.getDate()).slice(-2);

    // Create the formatted date string in "yyyy-mm-dd" format
    let formattedDate = year + "-" + month + "-" + day;

    console.log(formattedDate); // Output: yyyy-mm-dd formatted date

    res.render("admin/salesreport", { formattedDate });
  } catch (error) {
    console.log(error);
  }
};

const report = async (req, res) => {
  try {
    const startDate = req.query.start;
    const endDate = req.query.end;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(
      `http://localhost:3000/salesReport?start=${startDate}&end=${endDate}`,
      {
        waitUntil: "networkidle2",
      }
    );
    await page.setViewport({ width: 1680, height: 1050 });
    const todayDate = new Date();
    const pdfn = await page.pdf({
      path: `${path.join(
        __dirname,
        "../public/files",
        todayDate.getTime() + ".pdf"
      )}`,
      format: "A4",
    });

    await browser.close();

    const pdfUrl = path.join(
      __dirname,
      "../public/files",
      todayDate.getTime() + ".pdf"
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfn.length,
    });
    res.sendFile(pdfUrl);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  getLogin,
  postLogin,
  getAdminHome,
  getLogout,
  getUserManagement,
  getBlockUnblock,
  getproductManagement,
  getcategorymanagement,
  getaddCategory,
  postaddCategory,
  getaddproducts,
  postAddProduct,
  deleteProductById,
  getEditProduct,
  getOrder,
  viewSingleOrder,
  updateStatus,
  deleteSingle,
  updateProduct,
  getBanner,
  getAddBanner,
  postAddBanner,
  getAddCoupon,
  getCoupon,
  postAddCoupon,
  offerPrice,
  postOfferPrice,
  getSalesReport,
  report,
};
