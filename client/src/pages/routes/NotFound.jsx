// NotFound.jsx

import React from 'react';

const NotFound = () => {
  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <h1 style={styles.heading}>Page Not Found</h1>
        <p style={styles.paragraph}>Do not worry, happy times!</p>
        <p style={styles.paragraph}>Your error routing works perfectly :D!</p>
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    color: '#333',
    textAlign: 'center',
  },
  main: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    fontSize: '2rem',
    marginBottom: '1rem',
    color: '#d32f2f',
  },
  paragraph: {
    fontSize: '1.2rem',
    marginBottom: '0.5rem',
    color: '#555',
  },
};

export default NotFound;
