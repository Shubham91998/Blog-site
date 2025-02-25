require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const Blog = require("./models/blog");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const {
  checkForAuthenticationCookie,
} = require("./middeleware/authentication");

const app = express();

const PORT = process.env.PORT || 8001;

mongoose
  .connect(process.env.MONGO_URL)
  .then((e) => console.log("mongodb connected"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials:true
}))
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static("public"));

app.use("/userProfileImage",express.static(path.join(__dirname, "public", "userProfileImage")));
app.use("/uploads", express.static(path.join(__dirname, "public","uploads")));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({}).populate("createdBy");
  res.locals.user = req.user || null;
  res.render("home", {
    blogs: allBlogs,
  });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
