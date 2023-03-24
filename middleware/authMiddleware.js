import AsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import UserModel from "../model/userModel.js";

const protect = AsyncHandler(async (req, res, next) => {
  const authHeader = req.headers["Authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    res.status(401);
    throw new Error("Invalid token");
  }

  const token = authHeader.split(" ")[1];

  const verified = jwt.verify(token, process.env.JWT_SECRET);

  if (!verified) {
    res.status(401);
    throw new Error("Invalid token");
  }
  const user = await UserModel.findById(verified.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  req.user = user;
  next();
});

export default protect;
