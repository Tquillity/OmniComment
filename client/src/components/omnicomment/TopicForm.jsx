// TopicForm.jsx
import React, { useState } from 'react';

const TopicForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
  });

  const { title, subject } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(title, subject);
    setFormData({ title: '', subject: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
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
  );
};

export default TopicForm;