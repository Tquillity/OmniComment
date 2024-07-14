// Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import useForm from '../hooks/useForm';
import { registerUser } from '../services/authServices';

const initialState = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'user',
};

const Register = () => {
  const [formData, handleChange] = useForm(initialState);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    isError: false,
  });
  const navigate = useNavigate();

  const showModal = (title, message, isError) => {
    setModalState({
      isOpen: true,
      title,
      message,
      isError,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showModal('Registration Error', 'Passwords do not match.', true);
      return;
    }

    try {
      await registerUser(formData);
      showModal('Registration Successful', 'Your account has been created successfully.', false);
    } catch (error) {
      showModal('Registration Error', error.message || 'An error occurred during registration.', true);
    }
  };

  const handleModalClose = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    if (!modalState.isError) {
      navigate('/login');
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          {['username', 'email', 'password', 'confirmPassword'].map((field) => (
            <div key={field} className="form-group">
              <label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
              <input
                id={field}
                type={field.toLowerCase().includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
          <div className="form-group">
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="reward">Reward</option>
            </select>
          </div>
          <button type="submit">Register</button>
        </form>
      </div>
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

export default Register;
