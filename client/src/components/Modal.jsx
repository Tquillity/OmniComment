// Modal.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Modal = ({ isOpen, onClose, title, message, isError = false }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${isError? 'error' : 'success'}`} onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onClose}>OK!</button>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  isError: PropTypes.bool,
};

export default Modal;