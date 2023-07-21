const express = require("express");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router();

const User = require("../models/User");

const { body, validationResult } = require("express-validator");


const JWT_SECRET = "QuickJot_NoteTakingApp";

router.post(
  "/",
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
      const secPass = await bcrypt.hash(req.body.password, salt)


      let user = await User.create({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: secPass,
      });
      
    //   Creating JsonWebToken
      const data ={
        user : {
            id : user.id
        }
      }
      const authtoken = jwt.sign(data, JWT_SECRET);
      
      res.json({ authtoken });

    } catch (error) {
        //error if occurred
      console.log(error);
      res.status(500).json({ message: "Error Occurred" });
    }
  }
);

module.exports = router;
