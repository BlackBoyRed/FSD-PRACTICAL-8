const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/authMiddleware");
const multer = require("multer");

// Multer config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ADD PRODUCT (Protected)
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      image: req.file ? req.file.path : null
    });

    await product.save();
    res.json(product);

  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// GET PRODUCTS
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);

  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;