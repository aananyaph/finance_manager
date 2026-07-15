import bcrypt from "bcrypt";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// Register User
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });

    // Automatically seed the demo user if logging in with the default demo credentials
    if (!user && email === "ananya@gmail.com" && password === "123456") {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        fullName: "Ananya Sharma",
        email: "ananya@gmail.com",
        password: hashedPassword,
      });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        token: generateToken(user._id),
      });
    }

    return res.status(401).json({
      message: "Invalid email or password",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  res.json(req.user);
};