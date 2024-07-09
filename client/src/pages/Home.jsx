// Home.jsx
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

const Home = () => {
  const { auth } = useOutletContext();
  const { user } = useUser();

  return (
    <div className="home-container">
      <h1>-- == OmniComment == --</h1>
      {auth ? (
        <>
          <h2>Welcome, {user?.username || 'User'}!</h2>
          <p>Dive into the world of OmniComment. Share your thoughts, engage in discussions, and explore trending topics!</p>
        </>
      ) : (
        <>
          <h2>Welcome to OmniComment</h2>
          <p>Join our community to share your thoughts and engage in exciting discussions. Sign up or log in to get started!</p>
        </>
      )}
    </div>
  );
};

export default Home;