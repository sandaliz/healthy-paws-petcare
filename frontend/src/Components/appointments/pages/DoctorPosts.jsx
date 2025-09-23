import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar';
import PostServices from '../services/PostServices';
import state from '../store/state';
import { useNavigate } from 'react-router-dom';


const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = state.currentUser;
  const navigate = useNavigate();

  const fetchPosts = async (userId) => {
   setLoading(true);
    try {
      const data = await PostServices.getPostsByUserId(userId);
      setPosts(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch posts. Please check your server.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPosts(userId);
    }
  }, [userId]);

  // Function to format the date from the timestamp
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <div>
      <Navbar />
      <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto p-4 md:p-8">
          <div className="flex justify-end mb-6">
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200"
              onClick={() => navigate('/createpost')}
            >
              + New Post
            </button>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 w-full col-span-full">Loading posts...</p>
          ) : error ? (
            <p className="text-center text-red-500 w-full col-span-full">{error}</p>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {posts.map(post => (
                <div
                  key={post._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105"
                >
                  {/* Construct the image URL from the base URL and the relative path */}
                  <img
                    src={`http://localhost:4000/${post.imagePath}`}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h1 className="text-xl font-bold mb-2 text-gray-800">{post.title}</h1>
                    <p className="text-gray-600 line-clamp-3 mb-4">{post.content}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <p>Author: {post.userName}</p>
                      <p>Date: {formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 w-full col-span-full">No posts to display yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AllPosts
