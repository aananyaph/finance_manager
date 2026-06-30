import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      next();
    // } catch (error) {
    //   return res.status(401).json({
    //     message: "Not authorized. Invalid token.",
    //   });
    // }
     } catch (error) {
  console.log(error);
  return res.status(401).json({
    message: error.message,
  });
}  
  }

  if (!token) {
    return res.status(401).json({
      message: "No token provided.",
    });
  }
};

export default protect;