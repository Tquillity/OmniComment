// Login.jsx
import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import useForm from '../hooks/useForm';
import { loginUser } from '../services/authServices';
import Modal from '../components/Modal';

const initialState = {
  email: '',
  password: '',
};

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useOutletContext();
  const [formData, handleChange] = useForm(initialState);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    isError: false
  });

  const showModal = (title, message, isError) => {
    setModalState({
      isOpen: true,
      title,
      message,
      isError
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(formData);
      localStorage.setItem('token', res.token);
      setAuth(true);
      navigate('/');
    } catch (error) {
      showModal('Login Error', error.message, true);
    }
  };

  const handleModalClose = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1>Login</h1>
        {['email', 'password'].map((field) => (
          <div key={field} className="form-group">
            <label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
            <input
              id={field}
              type={field === 'password' ? 'password' : 'email'}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <button type="submit">Login</button>
      </form>
      <Modal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        title={modalState.title}
        message={modalState.message}
        isError={modalState.isError}
      />
    </div>
  );
};

export default Login;