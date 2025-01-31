const { Router } = require("express");
const multer = require("multer");
const User = require("../models/user");
const path = require("path");
const { uploadOnCloudinary } = require("../services/cloudinary");

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, path.resolve(`./public/userProfileImage/`));
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname);
  },
});

const upload = multer({ 
  storage: storage,
});


router.get("/signin", (req, res) => {
  return res.render("signin");
});

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect email or password.",
    });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});



router.post("/signup", upload.single("userProfileImage"), async (req, res) => {

  try {
    const { fullname, email, password } = req.body;
    console.log(req.body)

    const defaultImage = "/userProfileImage/userp.jpeg";

    let profileImageURL;
    if (req.file) {
      profileImageURL = await uploadOnCloudinary(req.file.path); // Upload to Cloudinary
      console.log(profileImageURL)
    } else {
      profileImageURL = defaultImage;
      console.log(profileImageURL)
    }
    
    const newUser = new User({
      fullname,
      email,
      password,
      profileImageURL,
    });
    console.log(newUser)

    await newUser.save();
    return res.render("signin");
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(400).send("Email already exists.");
    }

    res.status(500).send("Error registering user.");
  }
});

router.get("/updatePicture", (req, res) => {
  return res.render("update")
})


router.post("/updatePicture", upload.single("userProfileImage"), async (req, res) => {
  try {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded or file type is not allowed." });
    }

    const userId = req.user._id; 
    console.log(userId)
    const profileImageURL = `/userProfileImage/${req.file.filename}`;
    console.log("Sucessful update file") 
    await User.findByIdAndUpdate(userId, { profileImageURL });
    res.render("signin")
} catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating profile image." });
}
})

module.exports = router;
