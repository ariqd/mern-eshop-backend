const { Product } = require("../models/product");
const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];

    let uploadError = new Error("Invalid image type");

    if (isValid) {
      uploadError = null;
    }

    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];

    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

// Get all products
router.get(`/`, async (req, res) => {
  // Filter by category
  let filter = {};

  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }

  const productList = await Product.find(filter).populate("category");
  // .select("name image -_id");

  if (!productList) {
    res.status(500).json({ success: false });
  }

  res.send(productList);
});

// Get a single product
router.get(`/:id`, async (req, res) => {
  const productList = await Product.findById(req.params.id).populate(
    "category"
  );

  if (!productList) {
    res.status(500).json({ success: false });
  }

  res.send(productList);
});

// Insert product
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);

  if (!category) return res.status(400).send("Invalid category");

  if (!req.file) return res.status(400).send("No image uploaded!");

  const fileName = req.file.filename;

  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();

  if (!product) return res.status(500).send("The products cannot be created");

  return res.status(201).send(product);
});

// Update product
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    res.status(400).send("Inavlid product ID");

  const category = await Category.findById(req.body.category);

  if (!category) return res.status(400).send("Invalid category");

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    {
      new: true, // return the updated data instead of old data
    }
  );

  if (!product) return res.status(404).send("The product cannot be created");

  res.status(200).send(product);
});

// Delete product
// /api/v1/asdasd-id
router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product)
        return res.status(200).json({
          success: true,
          message: "The product is deleted!",
        });

      return res
        .status(404)
        .json({ success: false, message: "The product is not found" });
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

// Get products count
router.get("/get/count", async (req, res) => {
  const productCount = await Product.countDocuments((count) => count);

  if (!productCount) return res.status(500).json({ success: false });

  return res.send({
    productCount: productCount,
  });
});

// Get featured products
router.get("/get/featured/:count?", async (req, res) => {
  const count = req.params.count ? req.params.count : 0;

  const products = await Product.find({
    isFeatured: true,
  }).limit(+count);

  if (!products) {
    res.status(500).json({ success: false });
  }

  res.send(products);
});

router.put(
  `/gallery-images/:id`,
  uploadOptions.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send("Inavlid product ID");
    }

    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    const files = req.files;
    let imagesPaths = [];

    if (files) {
      files.map(file => {
        console.log(file)
        imagesPaths.push(`${basePath}${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { images: imagesPaths },
      { new: true }
    );

    if (!product) return res.status(404).send("The product images cannot be updated");

    res.status(200).send(product);
  }
);

module.exports = router;
