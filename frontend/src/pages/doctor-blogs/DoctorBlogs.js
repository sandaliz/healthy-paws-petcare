import { useState, useEffect } from "react";
import Modal from "react-modal";
import {
  createBlog,
  getBlogs,
  deleteBlog,
  updateBlog,
} from "../../apis/blogApi";
import cloudinaryService from "../../services/cloudinaryService";
import "./DoctorBlogs.css";

const DoctorBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    coverImage: "",
    isPublished: false,
  });
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    fetchBlogs();
    Modal.setAppElement(document.getElementById("root") || document.body);
  }, []);

  useEffect(() => {
    const filtered = blogs.filter(
      (blog) =>
        blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBlogs(filtered);
  }, [searchTerm, blogs]);

  const fetchBlogs = async () => {
    try {
      setFetchLoading(true);
      const data = await getBlogs();
      setBlogs(data["blogs"] ?? []);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const titleRegex = /^[a-zA-Z0-9\s\-.,!?]{5,100}$/;

    if (!titleRegex.test(formData.title)) {
      newErrors.title =
        "Title must be 5-100 characters, alphanumeric with basic punctuation";
    }

    if (formData.content.length < 50 || formData.content.length > 10000) {
      newErrors.content = "Content must be between 50-10000 characters";
    }

    if (formData.content.trim().length < 20) {
      newErrors.content = "Content must contain at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        coverImage: "Only JPEG, PNG, and WebP images are allowed",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        coverImage: "Image size must be less than 5MB",
      }));
      return;
    }

    setImageFile(file);
    setImageUploading(true);
    setErrors((prev) => ({ ...prev, coverImage: "" }));

    try {
      const result = await cloudinaryService.uploadImage(file);
      if (result.success) {
        setFormData((prev) => ({ ...prev, coverImage: result.url }));
      } else {
        setErrors((prev) => ({ ...prev, coverImage: result.error }));
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, coverImage: "Failed to upload image" }));
    } finally {
      setImageUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      coverImage: "",
      isPublished: false,
    });
    setErrors({});
    setImageFile(null);
    setCurrentBlog(null);
  };

  const handleCreateBlog = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createBlog(formData);
      await fetchBlogs();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      setErrors((prev) => ({ ...prev, submit: "Failed to create blog" }));
    } finally {
      setLoading(false);
    }
  };

  const handleEditBlog = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare update data - only include coverImage if it has been changed
      const updateData = {
        title: formData.title,
        content: formData.content,
        isPublished: formData.isPublished,
      };

      // Only add coverImage if it exists and is not empty
      if (formData.coverImage && formData.coverImage.trim() !== "") {
        updateData.coverImage = formData.coverImage;
      }

      await updateBlog(currentBlog._id, updateData);
      await fetchBlogs();
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      setErrors((prev) => ({ ...prev, submit: "Failed to update blog" }));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await deleteBlog(blogId);
        await fetchBlogs();
      } catch (error) {
        console.error("Failed to delete blog:", error);
      }
    }
  };

  const openEditModal = (blog) => {
    setCurrentBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      coverImage: blog.coverImage || "",
      isPublished: blog.isPublished,
    });
    setShowEditModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const removeCurrentImage = () => {
    setFormData((prev) => ({ ...prev, coverImage: "" }));
    setImageFile(null);
  };

  if (fetchLoading) {
    return <div className="loading">Loading blogs...</div>;
  }

  return (
    <div className="doctor-blogs">
      <div className="blogs-header">
        <h2>Blog Management</h2>
        <button className="create-btn" onClick={openCreateModal}>
          Create Blog
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search blogs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="blogs-table">
        <table>
          <thead>
            <tr>
              <th>Cover Image</th>
              <th>Title</th>
              <th>Content Preview</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBlogs.map((blog) => (
              <tr key={blog._id}>
                <td>
                  {blog.coverImage && (
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="blog-image"
                    />
                  )}
                </td>
                <td>{blog.title}</td>
                <td>{blog.content.substring(0, 100)}...</td>
                <td>
                  <span
                    className={`status ${
                      blog.isPublished ? "published" : "draft"
                    }`}
                  >
                    {blog.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => openEditModal(blog)}
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteBlog(blog._id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onRequestClose={() => setShowCreateModal(false)}
        className="modal blog-modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h3>Create New Blog</h3>
          <button onClick={() => setShowCreateModal(false)}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Blog Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={errors.title ? "error" : ""}
              placeholder="Enter blog title..."
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className={errors.content ? "error" : ""}
              placeholder="Write your blog content..."
              rows={12}
            />
            {errors.content && (
              <span className="error-text">{errors.content}</span>
            )}
          </div>

          <div className="form-group">
            <label>Cover Image</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {imageUploading && <span>Uploading...</span>}
            {formData.coverImage && (
              <div className="image-preview-container">
                <img
                  src={formData.coverImage}
                  alt="Preview"
                  className="image-preview"
                />
                <button
                  type="button"
                  onClick={removeCurrentImage}
                  className="remove-image-btn"
                >
                  Remove
                </button>
              </div>
            )}
            {errors.coverImage && (
              <span className="error-text">{errors.coverImage}</span>
            )}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
              />
              Publish immediately
            </label>
          </div>

          {errors.submit && <div className="error-text">{errors.submit}</div>}
        </div>
        <div className="modal-footer">
          <button onClick={() => setShowCreateModal(false)}>Cancel</button>
          <button onClick={handleCreateBlog} disabled={loading}>
            {loading ? "Creating..." : "Create Blog"}
          </button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onRequestClose={() => setShowEditModal(false)}
        className="modal blog-modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h3>Edit Blog</h3>
          <button onClick={() => setShowEditModal(false)}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Blog Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={errors.title ? "error" : ""}
              placeholder="Enter blog title..."
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className={errors.content ? "error" : ""}
              placeholder="Write your blog content..."
              rows={12}
            />
            {errors.content && (
              <span className="error-text">{errors.content}</span>
            )}
          </div>

          <div className="form-group">
            <label>Cover Image</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {imageUploading && <span>Uploading...</span>}
            {formData.coverImage && (
              <div className="image-preview-container">
                <img
                  src={formData.coverImage}
                  alt="Preview"
                  className="image-preview"
                />
                <button
                  type="button"
                  onClick={removeCurrentImage}
                  className="remove-image-btn"
                >
                  Remove
                </button>
              </div>
            )}
            {errors.coverImage && (
              <span className="error-text">{errors.coverImage}</span>
            )}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
              />
              Published
            </label>
          </div>

          {errors.submit && <div className="error-text">{errors.submit}</div>}
        </div>
        <div className="modal-footer">
          <button onClick={() => setShowEditModal(false)}>Cancel</button>
          <button onClick={handleEditBlog} disabled={loading}>
            {loading ? "Updating..." : "Update Blog"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorBlogs;
