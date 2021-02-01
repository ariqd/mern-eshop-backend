const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require('cors');

app.use(cors());
app.options('*', cors());

require("dotenv/config");

// Middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));

// Routers
const productsRouter = require("./routers/products");
const categoriesRouter = require("./routers/categories");
const ordersRouter = require("./routers/orders");
const usersRouter = require("./routers/users");

const api = process.env.API_URL;

app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/users`, usersRouter);

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

