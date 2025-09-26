import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    content: { type: String, required: true },

    coverImage: { type: String, default: "" }, // optional

    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
