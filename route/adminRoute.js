const express = require("express");
const adminRoute = express();
const adminController = require("../controller/admin_Controller");
const authMiddleware = require("../middleware/adminAuthmMiddleware");

const path = require("path");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/product_images"));
  },
  filename: (req, file, cb) => {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/webp"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg .webp format allowed!"));
    }
  },
});

adminRoute.get("/login", authMiddleware.notLogged, adminController.getLogin);
adminRoute.post("/login", adminController.postLogin);

//adminhome
adminRoute.get("/", authMiddleware.logged, adminController.getAdminHome);

//logout
adminRoute.get("/logout", adminController.getLogout);

//user management
adminRoute.get("/user_management",authMiddleware.logged,adminController.getUserManagement);

//user blockunblock
adminRoute.get("/blockUnblock",authMiddleware.logged,adminController.getBlockUnblock);
module.exports = adminRoute;

//product management
adminRoute.get("/products",authMiddleware.logged,adminController.getproductManagement);

//add product page
adminRoute.get("/addProduct",authMiddleware.logged,adminController.getaddproducts);

//add product
adminRoute.post("/addProduct",authMiddleware.logged,upload.array("images", 4),adminController.postAddProduct);

//delete product
adminRoute.get("/delete_product",authMiddleware.logged,adminController.deleteProductById);

//category management
adminRoute.get("/category",authMiddleware.logged,adminController.getcategorymanagement);

//add category
adminRoute.get("/addcategory",authMiddleware.logged,adminController.getaddCategory);
adminRoute.post("/addcategory",authMiddleware.logged,adminController.postaddCategory);

//Edit product
adminRoute.get("/editproduct",authMiddleware.logged,adminController.getEditProduct);

//get orders page
adminRoute.get("/orders", authMiddleware.logged, adminController.getOrder);

//get single view of orders
adminRoute.get("/singleOrder",authMiddleware.logged,adminController.viewSingleOrder);
adminRoute.post("/updateStatus",authMiddleware.logged,adminController.updateStatus);

//post edit products
adminRoute.post("/editproduct",authMiddleware.logged,upload.array("image", 2),adminController.updateProduct);
adminRoute.post("/delete-image",authMiddleware.logged,adminController.deleteSingle);

//banner managent
adminRoute.get("/banner", authMiddleware.logged, adminController.getBanner);
adminRoute.get("/addbanner",
  authMiddleware.logged,
  adminController.getAddBanner
);
adminRoute.post("/addBanner",authMiddleware.logged,upload.single("image"),adminController.postAddBanner);

//coupon management
adminRoute.get("/coupon",authMiddleware.logged,adminController.getCoupon);
adminRoute.get("/addCoupon",authMiddleware.logged,adminController.getAddCoupon);
adminRoute.post("/addCoupon",authMiddleware.logged,adminController.postAddCoupon);

//offer price
adminRoute.get("/category/offerprice",authMiddleware.logged,adminController.offerPrice)
adminRoute.post("/category/offerprice",authMiddleware.logged,adminController.postOfferPrice)

//Sales Report
adminRoute.get("/salesreport",authMiddleware.logged,adminController.getSalesReport)
adminRoute.get("/report",authMiddleware.logged,adminController.report)