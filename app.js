const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const { json } = require("body-parser");

// Middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));

require("dotenv/config");
const api = process.env.API_URL;

const productSchema = mongoose.Schema({
  name: String,
  image: String,
  countInStock: {
    type: Number,
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);

app.get(`${api}/products`, async (req, res) => {
  const productList = await Product.find();

  if (!productList) {
    res.status(500).json({ success: false });
  }

  res.send(productList);
});

app.post(`${api}/products`, (req, res) => {
  // const newProduct = req.body;
  // console.log("newProduct", newProduct);
  const product = new Product({
    name: req.body.name,
    image: req.body.image,
    countInStock: req.body.countInStock,
  });

  product
    .save()
    .then((createdProduct) => {
      res.status(201).json(createdProduct);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
        success: false,
      });
    });

  // res.send(newProduct);
});

mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "mern-eshop",
  })
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => console.log(err));

app.listen(3000, () => {
  // console.log(api);
  console.log("server is running at http://localhost:3000");
});
