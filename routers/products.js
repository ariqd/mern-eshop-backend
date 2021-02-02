const { Product } = require("../models/product");
const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Get all products
router.get(`/`, async (req, res) => {
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
router.post(`/`, async (req, res) => {
  // const newProduct = req.body;
  // console.log("newProduct", newProduct);
  const category = await Category.findById(req.body.category);

  if (!category) return res.status(400).send("Invalid category");

  let product = new Product({
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
  });

  product = await product.save();

  if (!product) return res.status(500).send("The products cannot be created");

  return res.status(201).send(product);

  // product
  //   .save()
  //   .then((createdProduct) => {
  //     res.status(201).json(createdProduct);
  //   })
  //   .catch((err) => {
  //     res.status(500).json({
  //       error: err,
  //       success: false,
  //     });
  //   });

  // res.send(newProduct);
});

// Update product
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Inavlid product ID");
  }

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

module.exports = router;
