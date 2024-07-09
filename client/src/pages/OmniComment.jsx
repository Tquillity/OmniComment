import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TopicForm from '../components/omnicomment/TopicForm';
import CommentForm from '../components/omnicomment/CommentForm';
import TopicListItem from '../components/omnicomment/TopicListItem';
import CommentListItem from '../components/omnicomment/CommentListItem';
import { formatDate } from '../utilities/dateUtils';

const OmniComment = ({ auth }) => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [userName, setUserName] = useState('');
  const [view, setView] = useState('list');

  useEffect(() => {
    fetchTopics();
    fetchUser();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/v1/comments');
      setTopics(res.data.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch topics');
    }
  };

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

  const onSubmitTopic = async (title, subject) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to create a topic');
      return;
    }
    try {
      const transactionRes = await axios.post(
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
  
      const res = await axios.post(
        'http://localhost:5001/api/v1/comments',
        {
          commentNumber: new Date().getTime(),
          title,
          subject,
          userName,
          sourceAddress: 'forum',
          commentVibes: 'neutral',
          transactionId: transactionRes.data.data._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setTopics([...topics, res.data.data]);
      alert('Topic created successfully');
    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      alert('Failed to create topic');
    }
  };

  const onSubmitComment = async (commentText) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to post a comment');
      return;
    }
    try {
      const transactionRes = await axios.post(
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
  
      const res = await axios.post(
        'http://localhost:5001/api/v1/comments',
        {
          commentNumber: new Date().getTime(),
          title: `${selectedTopic.title}.${new Date().getTime()}`,
          parentTopic: selectedTopic.title,
          subject: commentText,
          userName,
          sourceAddress: selectedTopic.sourceAddress,
          commentVibes: 'neutral',
          transactionId: transactionRes.data.data._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      fetchTopics();
      alert('Comment submitted successfully');
    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      alert('Failed to submit comment');
    }
  };

  const handleVote = async (id, voteType) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to vote');
      return;
    }
    try {
      const newVibe = voteType === 'up' ? 'positive' : 'negative';
      await axios.put(
        `http://localhost:5001/api/v1/comments/${id}`,
        { commentVibes: newVibe },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchTopics();
    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      alert('Failed to vote');
    }
  };

  const getCommentCount = (topic) => {
    return topic.comments ? topic.comments.length : 0;
  };

  const getMainTopics = () => {
    return topics.filter(topic => topic.isMainTopic);
  };

  const getComments = () => {
    return selectedTopic?.comments || [];
  };

  return (
    <div className="forum-container">
      <h1>Forum</h1>

      {view === 'list' && (
        <>
          <div className="create-topic">
            <h2>Create a New Topic</h2>
            <TopicForm onSubmit={onSubmitTopic} />
          </div>

          <div className="topics-list">
            <h2>Topics</h2>
            <ul>
              {getMainTopics().map((topic) => (
                <TopicListItem
                  key={topic._id}
                  topic={topic}
                  onClick={() => { setSelectedTopic(topic); setView('detail'); }}
                  onVote={handleVote}
                />
              ))}
            </ul>
          </div>
        </>
      )}

      {view === 'detail' && selectedTopic && (
        <div className="selected-topic">
          <button className="back-button" onClick={() => setView('list')}>Back to List</button>
          <h2>{selectedTopic.title}</h2>
          <p className="topic-meta">
            Posted by {selectedTopic.userName} on {formatDate(selectedTopic.createdAt)}
          </p>
          <p>{selectedTopic.subject}</p>
          <div className="vote-buttons">
            <button onClick={() => handleVote(selectedTopic._id, 'up')}>👍</button>
            <span>{selectedTopic.commentVibes}</span>
            <button onClick={() => handleVote(selectedTopic._id, 'down')}>👎</button>
          </div>
          <h3>Comments</h3>
          <ul className="comments-list">
            {getComments().map((comment) => (
              <CommentListItem key={comment._id} comment={comment} onVote={handleVote} />
            ))}
          </ul>

          <CommentForm onSubmit={onSubmitComment} />
        </div>
      )}
    </div>
  );
};

export default OmniComment;