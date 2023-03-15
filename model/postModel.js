import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    title: String,
    likes: [],
    image: String,
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, required: true },
        username: { type: String, required: true },
        profileImage: String,
        comment: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
