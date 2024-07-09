import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../components/Modal';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    isError: false
  });
  const navigate = useNavigate();

  const { username, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setModalState({
        isOpen: true,
        title: 'Registration Error',
        message: 'Passwords do not match.',
        isError: true
      });
      return;
    }
    try {
      const res = await axios.post('http://localhost:5001/api/v1/auth/register', formData);
      console.log(res.data);
      setModalState({
        isOpen: true,
        title: 'Registration Successful',
        message: 'Your account has been created successfully.',
        isError: false
      });
    } catch (err) {
      console.error(err.response.data);
      setModalState({
        isOpen: true,
        title: 'Registration Error',
        message: err.response.data.message || 'An error occurred during registration.',
        isError: true
      });
    }
  };

  const handleModalClose = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    if (!modalState.isError) {
      navigate('/login');
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h1>Register</h1>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              placeholder='Username'
              name="username"
              value={username}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address:</label>
            <input
              id="email"
              type="email"
              placeholder='Email Address'
              name="email"
              value={email}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              placeholder='Password'
              name="password"
              value={password}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              required
            />
          </div>
          <button type="submit">Register</button>
        </form>
      </div>
    
      <Modal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        title={modalState.title}
        message={modalState.message}
      />

    </div>
  );
};

export default Register;