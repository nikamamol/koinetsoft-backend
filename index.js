const express = require("express");
const cors = require("cors");
const UserAuthRouter = require("./src/routes/AuthRouter");
const dbConnect = require("./src/lib/connection");
const ensureAuthenticated = require("./src/middleware/auth");

const app = express();
app.use(express.json());
require("dotenv").config();

// Enable CORS for all routes
app.use(cors({
  origin: '*', // replace with your allowed origin
}));


//routes
app.use("/user",UserAuthRouter);

dbConnect();
app.listen(process.env.PORT, () => {
  console.log("localhost:",process.env.PORT);
});
