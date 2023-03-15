import express from "express";
import {
  ChangeUserPassword,
  DeleteUser,
  FollowUser,
  ForgetPassword,
  GetAllUsers,
  GetUser,
  IsUserLoggedIn,
  LoginUser,
  RegisterUser,
  ResetPassword,
  UpdateUser,
} from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";
import { uploads } from "../utils/fileUploads.js";

const router = express.Router();

router.post("/register", uploads.single("image"), RegisterUser);
router.post("/login", LoginUser);
router.get("/getAllUsers", GetAllUsers);
router.get("/getuser", protect, GetUser);
router.get("/isLoggedIn", IsUserLoggedIn);
router.patch("/update", uploads.single("image"), protect, UpdateUser);
router.post("/change-password/:id", ChangeUserPassword);
router.delete("/delete/", protect, DeleteUser);
router.post("/forgot-password", ForgetPassword);
router.put("/reset-password/:resetToken", ResetPassword);
router.put("/:id/follow", FollowUser);

export { router as UserRoutes };
