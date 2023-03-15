import UserModel from "../model/userModel.js";
import AsyncHandler from "express-async-handler";
import { Post } from "../model/postModel.js";
import { mongoose } from "mongoose";

export const CreatePost = AsyncHandler(async (req, res) => {
  const { title, image } = req.body;

  const { id } = req.user;
  const post = new Post({
    title,
    image,
    user: id,
  });

  await post.save();
  res.status(201).json(post);
});

export const GetAllPosts = AsyncHandler(async (req, res) => {
  const posts = await Post.find();
  res.status(200).json(posts);
});

export const GetPostById = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (post) {
    res.status(200).json(post);
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

export const UpdatePost = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, image } = req.body;
  const post = await Post.findById(id);
  if (post) {
    post.title = title;
    post.image = image;
    await post.save();
    res.status(200).json(post);
    return;
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

export const DeletePost = AsyncHandler(async (req, res) => {
  const { _id } = req.user;
  const post = await Post.findById(_id);
  if (post) {
    await post.remove();
    res.status(200).send("post deleted successfully");
    return;
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

export const likePost = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const post = await Post.findById(id);
    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (!post.likes.includes(user._id)) {
      await post.updateOne({ $push: { likes: user._id } });
      res.status(200).send("post liked");
    }

    if (post.likes.includes(user._id)) {
      await post.updateOne({ $pull: { likes: user._id } });
      res.status(200).send("post unliked");
    }
  } catch (error) {
    res.send(500).send("unable to like, try again later");
  }
});

export const getTimelinePosts = AsyncHandler(async (req, res) => {
  const { userId } = req.params;

  const currentUserPosts = await Post.find({ user: userId });
  if (!currentUserPosts) {
    res.status(404);
    throw new Error("Post not found");
  }

  let id = mongoose.Types.ObjectId(userId);
  const followingPosts = await UserModel.aggregate([
    {
      $match: {
        _id: id,
      },
    },
    {
      $lookup: {
        from: "posts",
        localField: "following",
        foreignField: "user",
        as: "followingPosts",
      },
    },
    {
      $project: {
        followingPosts: 1,
        _id: 0,
      },
    },
  ]);

  const timelinePosts = currentUserPosts
    .concat(...followingPosts[0].followingPosts)
    .sort((a, b) => {
      return b.createdAt - a.createdAt;
    });
  res.json(timelinePosts);
});

export const createPostComment = AsyncHandler(async (req, res) => {
  const { postId, profileImage, comment } = req.body;

  const post = await Post.findById(postId);

  if (!post) {
    res.json(404);
    throw new Error("post not found");
  }

  const comments = {
    user: req.user.id,
    username: req.user.username,
    comment: comment,
    profileImage: profileImage,
  };
  await post.updateOne({ $push: { comments: comments } });
  res.status(200).json(post);
});
