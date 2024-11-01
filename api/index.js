//Express server
const express = require("express");
//.env for security of variables
require("dotenv").config();
//MongoDB database
const mongoose = require("mongoose");

//cookie parser to parse cookies
const cookieParser = require("cookie-parser");
//cors so you can only make calls from a specific endpoint
const cors = require("cors");
const path = require("path");


//routes
const userRoutes = require('./routes/user')
const functionRoutes = require('./routes/function')
const groupRoutes = require('./routes/group')

//set express server to app variable to configure environment
const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));
app.use("/profilepictures", express.static("profilepictures"));

//parses data to json format
app.use(express.json());
//sets strict origin of calls to be from local host port
app.use(
  cors({
    credentials: true
  })
);
app.use(cookieParser());
//set up session ccokies to be secure and safe withy max age of 1 day
app.set('trust proxy', 1)

app.use("/", groupRoutes);
app.use("/", functionRoutes);
app.use("/", userRoutes);

//Connect to mongodb cluster
mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => {
    console.log("DATABASE INITIALIZED");
    //Start node js server after database connects
    app.listen(process.env.SERVER_PORT, () => {
      console.log(`SERVER STARTED ON PORT: ${process.env.SERVER_PORT}`);
    });
  })
  .catch((e) => {
    console.log("DATABASE FAILURE: ", e.message);
  });

app.get("/", (req, res) => {
  try {
    res.status(200).send(`Welcome to nodejs-project1`);
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/ping", (req, res) => {
  try {
    res.status(200).send({Message: `We have a connection!`, Success: true});
  } catch (error) {
    console.log(error.message);
  }
});

module.exports = app;



