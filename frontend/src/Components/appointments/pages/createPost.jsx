import React, { useState } from 'react';
import state from '../store/state';
import PostServices from '../services/PostServices';
import Navbar from '../components/Navbar';
import { App } from 'antd';

const CreatePost = () => {
  const { message } = App.useApp();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('userId', state.currentUser);
    formData.append('userName', state.currentUserName);
    formData.append('title', title);
    formData.append('content', content);
    if (image) {
      formData.append('imagePath', image);
    }

    try {
      const response = await PostServices.createPost(formData);
      if (response.status === 201) {
        console.log('Post created successfully!', response.data);
        setTitle('');
        setContent('');
        setImage(null);
        message.success('Post created successfully!');
      } else {
        console.error('Error creating post:', response.statusText);
        message.error(`Error: ${response.statusText}`);
      }
    } catch (error) {
        console.error('Failed to create post:', error.message);
        message.error('Failed to create post. Please try again.');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="bg-gray-100 min-h-screen p-8 flex items-center justify-center">
        <div className="max-w-3xl w-full mx-auto bg-white p-8 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Create a New Post</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                required
              />
            </div>

            {/* Content Field (using a simple textarea) */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg resize-none"
                required
              ></textarea>
            </div>

            {/* Image Upload Field */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Image
              </label>
              <input
                type="file"
                id="image"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full text-gray-700 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white font-semibold text-sm rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Publish Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
