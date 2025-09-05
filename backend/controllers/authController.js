const { response } = require('express');
const User = require('../models/User.js')
const jwt = require("jsonwebtoken");

//Generate JWT token
const generateToken = (id)=>{
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

//  Register User
exports.registerUser = async (req, res) => {
  // const { userName, email, password, profileImageUrl } = req.body 
  const { userName, email, password } = req.body 
  //need this to not get TypeError: Cannot destructure property 'userName' of 'req.body' as it is undefined.
                                                        || {}; 

  // Validation: check for missing fields
  if(!userName || !email || !password){
    return res.status(400).json({ message: "All fields are required"});
  };

  try {
    //Check if email already exists
    const existingUser = await User.findOne({email});
    if(existingUser)  {
      return res.status(400).json({ message: "Email already in use"});
    };

    //Create the user
    const user = await User.create({
      userName,
      email,
      password,
      // profileImageUrl,
    });

    res.status(201).json({
      id: user._id,
      user,
      token: generateToken(user._id),
    });
  } catch (err){
    res
      .status(500)
      .json({ message:"Error registering user", error: err.message });
  }
};

//  Login User
exports.loginUser = async (req, res) => {
  const { userNameOrEmail, password } = req.body || {};

  // Validation: check for missing fields
  if (!userNameOrEmail || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Find user by email or userName
    const user = await User.findOne({
      $or: [
        { email: userNameOrEmail },
        { userName: userNameOrEmail }
      ]
    });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      id: user._id,
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error logging in user", error: err.message });
  }
};

//  Get User Info 
exports.getUserInfo = async (req, res) => {
  try{
    const user = await User.findById(req.user.id).select("-password");

    if (!user){
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (err){
    res
      .status(500)
      .json({ message:"Error registering user", error: err.message }); //change Message ?
  }
};
