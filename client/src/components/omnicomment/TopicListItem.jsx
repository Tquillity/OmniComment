import React from 'react';
import { formatDate } from '../../utilities/dateUtils';

const TopicListItem = ({ topic, onClick, onVote }) => {
  const handleVote = (voteType) => {
    onVote(topic._id, voteType);
  };

  return (
    <li onClick={onClick}>
      <h3>{topic.title}</h3>
      <p className="topic-meta">
        Posted by {topic.userName} on {formatDate(topic.createdAt)}
      </p>
      <p>Comments: {topic.comments ? topic.comments.length : 0}</p>
      <div className="vote-buttons">
        <button onClick={(e) => { e.stopPropagation(); handleVote('up'); }}>👍</button>
        <span>{topic.commentVibes}</span>
        <button onClick={(e) => { e.stopPropagation(); handleVote('down'); }}>👎</button>
      </div>
    </li>
  );
};

export default TopicListItem;