import express from "express";
import {
  CreatePost,
  createPostComment,
  DeletePost,
  GetAllPosts,
  GetPostById,
  getTimelinePosts,
  likePost,
  UpdatePost,
} from "../controllers/postController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-post", protect, CreatePost);
router.get("/get-all-posts", GetAllPosts);
router.get("/get-post/:id", GetPostById);
router.patch("/update-post/:id",protect,  UpdatePost);
router.delete("/delete-post/:id",protect, DeletePost);
router.patch("/like/:id", protect, likePost);
router.get("/:userId/timeline", getTimelinePosts);
router.patch("/comment/post", protect, createPostComment);

export { router as PostRoutes };
