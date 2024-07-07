// WorkInProgress.jsx
import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
const navigate = useNavigate();
const { setAuth } = useOutletContext();

  const[formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const onChange = (e) =>  setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try{
      const res = await axios.post('http://localhost:5001/api/v1/auth/login', formData);
      console.log(res.data);
      setAuth(true);
      navigate('/trending');
    } catch (err) {
      if (err.response) {
        console.error(err.response.data);
      } else {
        console.error('Error:', err.message);
      }
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Login</h1>
      <div>
        <label>Email</label>
        <input type="email" name="email" value={email} onChange={onChange} required />
      </div>
      <div>
        <label>Password</label>
        <input type="password" name="password" value={password} onChange={onChange} required />
      </div>
      <button type="submit">Login</button>
    </form>  
  );
};

export default Login;
