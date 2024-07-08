import React from 'react';
import { formatDate } from '../../utilities/dateUtils';

const CommentListItem = ({ comment, onVote }) => {
  const handleVote = (voteType) => {
    onVote(comment._id, voteType);
  };

  return (
    <li>
      <p>{comment.subject}</p>
      <p className="comment-meta">
        Posted by {comment.userName} on {formatDate(comment.createdAt)}
      </p>
      <div className="vote-buttons">
        <button onClick={() => handleVote('up')}>👍</button>
        <span>{comment.commentVibes}</span>
        <button onClick={() => handleVote('down')}>👎</button>
      </div>
    </li>
  );
};

export default CommentListItem;