const express = require("express");
const UserAuthRouter = require("./src/routes/AuthRouter");
const dbConnect = require("./src/lib/connection");

const app = express();
app.use(express.json());
require("dotenv").config();

//routes
app.use("/user", UserAuthRouter);

dbConnect();
app.listen(4000, () => {
  console.log("http://localhost:4000");
});