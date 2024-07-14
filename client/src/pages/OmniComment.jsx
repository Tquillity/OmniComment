// OmniComment.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import TopicForm from "../components/omnicomment/TopicForm";
import CommentForm from "../components/omnicomment/CommentForm";
import TopicListItem from "../components/omnicomment/TopicListItem";
import CommentListItem from "../components/omnicomment/CommentListItem";
import { formatDate } from "../utilities/dateUtils";
import { asyncHandler, handleAsyncAction } from "../utilities/asyncUtils";

const OmniComment = ({ auth }) => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [userName, setUserName] = useState("");
  const [view, setView] = useState("list");

  useEffect(() => {
    fetchTopics();
    fetchUser();
  }, []);

  const fetchTopics = asyncHandler(async () => {
    const res = await axios.get("http://localhost:5001/api/v1/comments");
    if (res.error)
      throw new Error(res.error.message || "Failed to fetch topics");
    setTopics(res.data.data);
  });

  const fetchUser = asyncHandler(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const res = await axios.get("http://localhost:5001/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.error)
        throw new Error(
          res.error.message || "Failed to fetch user information"
        );
      setUserName(res.data.data.username);
    }
  });

  const onSubmitTopic = asyncHandler(async (title, subject) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Please login to create a topic");

    const res = await axios.post(
      "http://localhost:5001/api/v1/comments",
      {
        commentNumber: new Date().getTime(),
        title,
        subject,
        userName,
        sourceAddress: "forum",
        commentVibes: "neutral",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.error)
      throw new Error(res.error.message || "Failed to create topic");
    setTopics([...topics, res.data.data]);
    return "Topic created successfully";
  });

  const onSubmitComment = asyncHandler(async (commentText) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Please login to post a comment");

    const res = await axios.post(
      "http://localhost:5001/api/v1/comments",
      {
        commentNumber: new Date().getTime(),
        title: `${selectedTopic.title}.${new Date().getTime()}`,
        parentTopic: selectedTopic.title,
        subject: commentText,
        userName,
        sourceAddress: selectedTopic.sourceAddress,
        commentVibes: "neutral",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.error)
      throw new Error(res.error.message || "Failed to submit comment");
    await fetchTopics();
    return "Comment submitted successfully";
  });

  const handleVote = asyncHandler(async (id, voteType) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Please login to vote");

    const newVibe = voteType === "up" ? "positive" : "negative";
    const res = await axios.put(
      `http://localhost:5001/api/v1/comments/${id}`,
      { commentVibes: newVibe },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.error) throw new Error(res.error.message || "Failed to vote");
    await fetchTopics();
  });

  const getMainTopics = () => topics.filter((topic) => topic.isMainTopic);

  const getComments = () => selectedTopic?.comments || [];

  return (
    <div className="forum-container">
      <h1>Forum</h1>

      {view === "list" && (
        <>
          <div className="create-topic">
            <h2>Create a New Topic</h2>
            <TopicForm
              onSubmit={(title, subject) =>
                handleAsyncAction(() => onSubmitTopic(title, subject))
              }
            />
          </div>

          <div className="topics-list">
            <h2>Topics</h2>
            <ul>
              {getMainTopics().map((topic) => (
                <TopicListItem
                  key={topic._id}
                  topic={topic}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setView("detail");
                  }}
                  onVote={(id, voteType) =>
                    handleAsyncAction(() => handleVote(id, voteType))
                  }
                />
              ))}
            </ul>
          </div>
        </>
      )}

      {view === "detail" && selectedTopic && (
        <div className="selected-topic">
          <button className="back-button" onClick={() => setView("list")}>
            Back to List
          </button>
          <h2>{selectedTopic.title}</h2>
          <p className="topic-meta">
            Posted by {selectedTopic.userName} on{" "}
            {formatDate(selectedTopic.createdAt)}
          </p>
          <p>{selectedTopic.subject}</p>
          <div className="vote-buttons">
            <button
              onClick={() =>
                handleAsyncAction(() => handleVote(selectedTopic._id, "up"))
              }
            >
              👍
            </button>
            <span>{selectedTopic.commentVibes}</span>
            <button
              onClick={() =>
                handleAsyncAction(() => handleVote(selectedTopic._id, "down"))
              }
            >
              👎
            </button>
          </div>
          <h3>Comments</h3>
          <ul className="comments-list">
            {getComments().map((comment) => (
              <CommentListItem
                key={comment._id}
                comment={comment}
                onVote={(id, voteType) =>
                  handleAsyncAction(() => handleVote(id, voteType))
                }
              />
            ))}
          </ul>

          <CommentForm
            onSubmit={(commentText) =>
              handleAsyncAction(() => onSubmitComment(commentText))
            }
          />
        </div>
      )}
    </div>
  );
};

export default OmniComment;
