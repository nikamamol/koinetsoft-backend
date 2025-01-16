const express = require("express");
const cors = require("cors");
const UserAuthRouter = require("./src/routes/AuthRouter");
const dbConnect = require("./src/lib/connection");
const cookieParser = require('cookie-parser');
// const path = require("path");


const app = express();
app.use(cookieParser());
app.use(express.json());
require("dotenv").config();


// Enable CORS for all routes
app.use(cors({
    origin: '*', // replace with your allowed origin
    // origin: 'http://localhost:5174/', 
    // 
}));


//routes
app.use("/user", UserAuthRouter);

dbConnect();
app.listen(process.env.PORT, () => {
    console.log("localhost:", process.env.PORT);
});


// build 
// const express = require("express");
// const cors = require("cors");
// const UserAuthRouter = require("./src/routes/AuthRouter");
// const dbConnect = require("./src/lib/connection");
// const cookieParser = require('cookie-parser');
// const path = require("path");


// const app = express();
// app.use(cookieParser());
// app.use(express.json());
// require("dotenv").config();


// // Enable CORS for all routes
// app.use(cors({
//     origin: '*', // replace with your allowed origin
// }));


// app.use(express.static(path.join(__dirname, "build")));

// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "build", "index.html"));
// });
// //routes
// app.use("/user", UserAuthRouter);

// dbConnect();
// app.listen(process.env.PORT, () => {
//     console.log("localhost:", process.env.PORT);
// });