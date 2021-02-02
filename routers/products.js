const { Product } = require("../models/product");
const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();

// Get all products
router.get(`/`, async (req, res) => {
  const productList = await Product.find().populate("category");
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

module.exports = router;
