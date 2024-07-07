// WorkInProgress.jsx
import React, { useState } from 'react';

import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
  });

  const { username, email, password } = formData;

  const onchange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    try{
      const res = await axios.post('http://localhost:5001/api/v1/auth/register', formData);
      console.log(res.data);      
      // ! Redirect to login page
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Register</h1>
      <div>
        <label>Username</label>
        <input type="text" name="username" value={username} onChange={onchange} required />
      </div>
      <div>
        <label>Email</label>
        <input type="email" name="email" value={email} onChange={onchange} required />
      </div>
      <div>
        <label>Password</label>
        <input type="password" name="password" value={password} onChange={onchange} required />
      </div>
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
