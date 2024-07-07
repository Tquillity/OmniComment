// OmniComment.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OmniComment = ({ auth }) => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
  });
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');

  const { title, subject } = formData;

  useEffect(() => {
    // Fetch existing topics when component loads
    const fetchTopics = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/v1/comments');
        setTopics(res.data.data);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch topics');
      }
    };
    fetchTopics();
  
    // Fetch user information
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('http://localhost:5001/api/v1/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserName(res.data.data.username);
        } catch (err) {
          console.error(err);
          alert('Failed to fetch user information');
        }
      }
    };
    fetchUser();
  }, []);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const onCommentChange = (e) => setComment(e.target.value);

  const onSubmitTopic = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to create a topic');
      return;
    }
    try {
      // Deducting cryptocurrency for the new topic
      await axios.post(
        'http://localhost:5001/api/v1/wallet/transaction',
        {
          amount: 20,
          recipient: 'forum-system',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Create a new topic
      const res = await axios.post(
        'http://localhost:5001/api/v1/comments',
        {
          commentNumber: new Date().getTime(),
          title,
          subject,
          userName,
          sourceAddress: 'forum',
          commentVibes: 'neutral',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTopics([...topics, res.data.data]);
      setFormData({ title: '', subject: '' });
      alert('Topic created successfully');
    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      alert('Failed to create topic');
    }
  };

  const onSubmitComment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to post a comment');
      return;
    }
    try {
      // Deducting cryptocurrency for the comment
      await axios.post(
        'http://localhost:5001/api/v1/wallet/transaction',
        {
          amount: 10,
          recipient: 'forum-system',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Add comment to the selected topic
      await axios.post(
        'http://localhost:5001/api/v1/comments',
        {
          commentNumber: new Date().getTime(),
          title: selectedTopic.title,
          subject: comment,
          userName,
          sourceAddress: selectedTopic.sourceAddress,
          commentVibes: 'neutral',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Comment submitted successfully');
      setComment('');
    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      alert('Failed to submit comment');
    }
  };

  return (
    <div className="forum-container">
      <h1>Forum</h1>
      <div className="create-topic">
        <h2>Create a New Topic</h2>
        <form onSubmit={onSubmitTopic}>
          <div>
            <label>Title</label>
            <input type="text" name="title" value={title} onChange={onChange} required />
          </div>
          <div>
            <label>Subject</label>
            <textarea name="subject" value={subject} onChange={onChange} required></textarea>
          </div>
          <button type="submit">Create Topic</button>
        </form>
      </div>

      <div className="topics-list">
        <h2>Topics</h2>
        <ul>
          {topics.map((topic) => (
            <li key={topic._id} onClick={() => setSelectedTopic(topic)}>
              {topic.title}
            </li>
          ))}
        </ul>
      </div>

      {selectedTopic && (
        <div className="selected-topic">
          <h2>{selectedTopic.title}</h2>
          <p>{selectedTopic.subject}</p>
          <h3>Comments</h3>
          <ul>
            {topics
              .filter((t) => t.title === selectedTopic.title)
              .map((comment) => (
                <li key={comment._id}>{comment.subject}</li>
              ))}
          </ul>

          <form onSubmit={onSubmitComment}>
            <h3>Submit a Comment</h3>
            <div>
              <textarea value={comment} onChange={onCommentChange} required></textarea>
            </div>
            <button type="submit">Submit Comment</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default OmniComment;