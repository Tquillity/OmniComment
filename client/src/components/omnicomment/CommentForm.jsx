import React, { useState } from 'react';

const CommentForm = ({ onSubmit }) => {
  const [comment, setComment] = useState('');

  const onCommentChange = (e) => setComment(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(comment);
    setComment('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Submit a Comment</h3>
      <div>
        <textarea value={comment} onChange={onCommentChange} required></textarea>
      </div>
      <button type="submit">Submit Comment</button>
    </form>
  );
};

export default CommentForm;