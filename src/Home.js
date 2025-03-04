import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';

function Home() {
  const [posts, setPosts] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);
const API_BASE_URL = "http://ec2-3-7-45-150.ap-south-1.compute.amazonaws.com:5000";

  const fetchPosts = () => {
    axios
      .get("${API_BASE_URL}/api/posts")
      .then(response => setPosts(response.data))
      .catch(error => console.error("Error fetching posts:", error));
  };

  const handleLike = (postId) => {
    axios
      .post(`${API_BASE_URL}/api/posts/like/${postId}`)
      .then(response => {
        setPosts(posts.map(post => post._id === postId ? response.data : post));
      })
      .catch(error => console.error("Error liking post:", error));
  };

  const handleDelete = (postId) => {
    axios
      .delete(`${API_BASE_URL}/api/posts/${postId}`)
      .then(response => {
        setPosts(posts.filter(post => post._id !== postId));
        console.log(response.data.message);
      })
      .catch(error => console.error("Error deleting post:", error));
  };

  const handleCommentChange = (postId, value) => {
    setCommentInputs({
      ...commentInputs,
      [postId]: value
    });
  };

  const handleAddComment = (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText) return;
    
    axios
      .post(`${API_BASE_URL}/api/posts/comment/${postId}`, { text: commentText })
      .then(response => {
        setPosts(posts.map(post => post._id === postId ? response.data : post));
        setCommentInputs({ ...commentInputs, [postId]: "" });
      })
      .catch(error => console.error("Error adding comment:", error));
  };

  return (
    <div className="home">
      <h2>Recent Posts</h2>
      {posts.map(post => (
        <div key={post._id} className="post">
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          {post.file && (
            <div>
              {post.file.match(/\.(mp4|webm)$/) ? (
                <video width="320" height="240" controls>
                  <source src={`${API_BASE_URL}/uploads/${post.file}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img src={`${API_BASE_URL}/uploads/${post.file}`} alt="Post Media" />
              )}
            </div>
          )}
          <button onClick={() => handleLike(post._id)}>Like ({post.likes})</button>
          <button onClick={() => handleDelete(post._id)}>Delete</button>
          <Link to={`/update/${post._id}`}>
            <button>Update</button>
          </Link>
          <div className="comments">
            <h4>Comments:</h4>
            <ul>
              {post.comments.map((comment, index) => (
                <li key={index}>{comment.text}</li>
              ))}
            </ul>
            <input
              type="text"
              placeholder="Add a comment"
              value={commentInputs[post._id] || ""}
              onChange={(e) => handleCommentChange(post._id, e.target.value)}
            />
            <button onClick={() => handleAddComment(post._id)}>Comment</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Home;
