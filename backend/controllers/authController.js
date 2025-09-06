const { response } = require('express');
const User = require('../models/User.js');
const jwt = require("jsonwebtoken");

// Tạo JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Đăng ký người dùng
exports.registerUser = async (req, res) => {
  const { fullName, email, password } = req.body || {};

  // Kiểm tra các trường bắt buộc
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Vui lòng điền đầy đủ các trường" });
  }

  try {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    // Tạo người dùng mới
    const user = await User.create({
      fullName,
      email,
      password,
    });

    res.status(201).json({
      id: user._id,
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi đăng ký người dùng", error: err.message });
  }
};

// Đăng nhập người dùng
exports.loginUser = async (req, res) => {
  const { userNameOrEmail, password } = req.body || {};

  // Kiểm tra các trường bắt buộc
  if (!userNameOrEmail || !password) {
    return res.status(400).json({ message: "Vui lòng điền đầy đủ các trường" });
  }

  try {
    // Tìm người dùng qua email hoặc fullName
    const user = await User.findOne({
      $or: [
        { email: userNameOrEmail },
        { fullName: userNameOrEmail }
      ]
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Thông tin đăng nhập không hợp lệ" });
    }

    res.status(200).json({
      id: user._id,
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi đăng nhập", error: err.message });
  }
};

// Lấy thông tin người dùng
exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin người dùng", error: err.message });
  }
};