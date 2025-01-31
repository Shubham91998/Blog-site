const { Router } = require("express");
const multer = require("multer");
const fs = require("fs");
const router = Router();
const Blog = require('../models/blog');
const Comment = require('../models/comment');
const {uploadOnCloudinary} = require("../services/cloudinary.js");
const { asyncHandler } = require("../services/asyncHandlar.js");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ 
  storage: storage, 
});

router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.post('/comment/:blogId', async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

router.get('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate('createdBy');
  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

router.post("/", upload.single('coverImageURL'), asyncHandler(async (req, res) => {
 
  const { title, body } = req.body;
  const coverImageURL = req.file.path; // Correctly access the uploaded file


  if (!coverImageURL) {
    return res.status(400).send("Image file is required.");
  }

  try {
    const coverImage = await uploadOnCloudinary(coverImageURL);

    const blog = await Blog.create({
      body,
      title,
      coverImageURL: coverImage, // Use the URL directly
      createdBy: req.user._id,
    });
    return res.redirect(`/blog/${blog._id}`); // Redirect to the blog post
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error); // Log the error
    return res.status(500).send("An error occurred while uploading the image.");
  }
}));

module.exports = router;