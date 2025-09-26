import API from "./axiosInstance";

// Create blog
export const createBlog = async (blogData) => {
  const { data } = await API.post("/blogs", blogData);
  return data;
};

// Get all blogs
export const getBlogs = async () => {
  const { data } = await API.get("/blogs");
  return data;
};

// Get single blog
export const getBlogById = async (id) => {
  const { data } = await API.get(`/blogs/${id}`);
  return data;
};

// Update blog
export const updateBlog = async (id, updateData) => {
  const { data } = await API.put(`/blogs/${id}`, updateData);
  return data;
};

// Delete blog
export const deleteBlog = async (id) => {
  const { data } = await API.delete(`/blogs/${id}`);
  return data;
};
