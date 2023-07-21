const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const User = require("../models/User");

const { body, validationResult } = require("express-validator");

const JWT_SECRET = "QuickJot_NoteTakingApp";

// ROUTER 2 : Create User
router.post(
  "/createuser",
  //   parameters Validation
  [
    body("username").isLength({ min: 6 }),
    body("name", "name Invalid").isLength({ min: 6 }),
    body("password", "Password Invalid").isLength({ min: 8 }),
    body("email", "Enter Valid Email!").isEmail(),
  ],

  async (req, res) => {
    //checking result from validation block
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check Email Exits or not
    try {
      let userExist = await User.findOne({ email: req.body.email });
      // console.log(userExist);
      if (userExist) {
        return res.status(400).json({ error: "Email already in use!" });
      }

      // Check Username Exits or not
      userExist = await User.findOne({ username: req.body.username });
      // console.log(userExist);
      if (userExist) {
        return res.status(400).json({ error: "Username already in use!" });
      }

      //creating user
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      let user = await User.create({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: secPass,
      });

      //   Creating JsonWebToken
      const data = {
        id: user.id,
      };
      const authtoken = jwt.sign(data, JWT_SECRET);

      res.json({ authtoken });
    } catch (error) {
      //error if occurred
      console.log(error);
      res.status(500).json({ message: "Error Occurred" });
    }
  }
);

// ROUTER 2 : Authenticate and loggin the user
router.post(
  "/login",
  [body("username").isLength({ min: 6 }), body("password").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
      // Check if User Exists
      let user = await User.findOne({ username });
      if (!user) {
        //if user not exists return
        return res
          .status(400)
          .json({ message: "Please Login with correct Credentials" });
      }

      //Comparing password
      let passwordMatches = await bcrypt.compare(password, user.password);

      //if password doesnt matches
      if (!passwordMatches) {
        //if PASSWORD not  MATCHES
        return res
          .status(400)
          .json({ message: "Please Login with correct Credentials" });
      }

      // aFTER SUCCESSFULL LOGIN
      let data = {
        id: user.id,
      };

      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json({ authtoken });
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

const fetchuser = require("../middleware/fetchuser");

router.post("/getuser", fetchuser, async (req, res) => {
  try {
    userid = req.userid;
    const user = await User.findById(userid).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;
