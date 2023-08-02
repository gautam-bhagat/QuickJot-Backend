const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Token = require('../models/Token')
const sendEmail = require('../Utils/sendEmail');
const crypto = require('crypto');

const router = express.Router();

const User = require("../models/User");

const { body, validationResult } = require("express-validator");

const JWT_SECRET = "QuickJot_NoteTakingApp";


const ifUserNotVerified = async  (user) =>{
  //verification Token
  let token =await  Token.findOne({userid : user.id})
  if(!token){
    token = await new Token({
      userid : user._id,
      token : crypto.randomBytes(32).toString("hex")
    }).save();
  
  }
  const url = `https://dark-gold-caterpillar-veil.cyclic.cloud/api/auth/verify/${user._id}/${token.token}`;
  console.log(url)

  await sendEmail(user.email,'QuickJot - Verify Email',url)
}

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
    let success = 0;
    try {
      let userExist = await User.findOne({ email: req.body.email });
      // console.log(userExist);
      if (userExist) {
        return res.status(400).json({ success,message: "Email already in use!" });
      }

      // Check Username Exits or not
      userExist = await User.findOne({ username: req.body.username });
      // console.log(userExist);
      if (userExist) {
        return res.status(400).json({ success,message: "Username already in use!" });
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
      success = 1;
      // const authtoken = jwt.sign(data, JWT_SECRET);

      await ifUserNotVerified(user);

      let message = "Kindly Verify your mail through verification link sent to you";
      res.status(200).json({ success ,message});
    } catch (error) {
      //error if occurred
      console.log(error);
      res.status(500).json({ success, message: "Error Occurred" });
    }
  }
);

// ROUTER 2 : Authenticate and login the user
router.post(
  "/login",
  [body("username").isLength({ min: 6 }), body("password").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    let success = 0;
    try {
      // Check if User Exists
      let user = await User.findOne({ username });
      if (!user) {
        //if user not exists return
        return res
          .status(400)
          .json({ success ,message: "Please Login with correct Credentials" });
      }

      //Comparing password
      let passwordMatches = await bcrypt.compare(password, user.password);

      //if password doesnt matches
      if (!passwordMatches) {
        //if PASSWORD not  MATCHES
        return res
          .status(400)
          .json({ success, message: "Please Login with correct Credentials" });
      }

      // aFTER SUCCESSFULL LOGIN
      let data = {
        id: user.id,
      };

      if(!user.verified){
        
        await ifUserNotVerified(user)
        return res.status(200).json({message : "Kindly verify you email"})
      }

      const authtoken = jwt.sign(data, JWT_SECRET);
      success = 1;
      res.status(200).json({ success,authtoken });
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



//Verify Email
router.get('/verify/:id/:token', async (req,res)=>{


    try {

      console.log(req.params.id)
      console.log(req.params.token)

      let user = await User.findOne({_id : req.params.id});
  
      if(!user) {
        console.log("token null")
        return res.status(400).send("Invalid Link")}

       
      let  token = await Token.findOne({
        userid : req.params.id,
        token : req.params.token
        
      })

      if (!token){
        console.log("token null")
        return res.status(400).send("Invalid Link")
      }
      
      const  _id = req.params.id
      console.log(user)
      console.log(token)

     let newUser = {}
     newUser.verified = true
      user  = await  User.findByIdAndUpdate(
        _id,
        { $set: newUser },
        { new: true }
      );

      console.log(user)
      // await User.updateOne({_id : user._id,verified : true});
      token = await Token.findByIdAndDelete(token._id);

      res.status(200).send("Email Verified Succesfully !")

    } catch (error) {
      
    }
});


module.exports = router;
