import React, { useState, useEffect } from "react";
import { getBlogs } from "../../../apis/blogApi";
import "./UserBlogs.css";

const UserBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await getBlogs();
      setBlogs(response.blogs || response || []);
    } catch (err) {
      setError("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleBlogClick = (blog) => {
    setSelectedBlog(blog);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBlog(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div>

        <div className="loading">Loading blogs...</div>
      </div>
    );
  }

  return (
    <div>

      <div className="blogs-container">
        <div className="blogs-header">
          <h1>Latest Blogs</h1>
          <p>Discover amazing stories and insights</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {blogs.length === 0 ? (
          <div className="no-blogs">
            <h3>No blogs available</h3>
            <p>Check back later for new content!</p>
          </div>
        ) : (
          <div className="blogs-grid">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="blog-card"
                onClick={() => handleBlogClick(blog)}
              >
                <div className="blog-image">
                  <img
                    style={{ width: "100%" }}
                    src={blog.coverImage}
                    alt={blog.title}
                    loading="lazy"
                  />
                  <div className="blog-overlay">
                    <span>Read More</span>
                  </div>
                </div>
                <div className="blog-content">
                  <div className="blog-meta">
                    <span className="blog-date">
                      {formatDate(blog.createdAt)}
                    </span>
                    {blog.isPublished && (
                      <span className="published-badge">Published</span>
                    )}
                  </div>
                  <h3 className="blog-title">{blog.title}</h3>
                  <p className="blog-excerpt">
                    {truncateContent(blog.content)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && selectedBlog && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <button className="modal-close" onClick={closeModal}>
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-image">
                  <img src={selectedBlog.coverImage} alt={selectedBlog.title} />
                </div>
                <div className="modal-text">
                  <div className="modal-meta">
                    <span className="modal-date">
                      {formatDate(selectedBlog.createdAt)}
                    </span>
                    {selectedBlog.isPublished && (
                      <span className="published-badge">Published</span>
                    )}
                  </div>
                  <h2 className="modal-title">{selectedBlog.title}</h2>
                  <div className="modal-content-text">
                    {selectedBlog.content
                      .split("\n")
                      .map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBlogs;
