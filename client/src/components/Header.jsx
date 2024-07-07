import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './Layout/Themes/ThemeToggle.jsx';

const Header = ({ auth, logout }) => {

  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/blockchain">Blockchain</Link>
          </li>
          <li>
            <Link to="/omnicomment">OmniComment</Link>
          </li>
          <li>
            <Link to="/trending">Trending</Link>
          </li>
          {auth ? (
            <>
              <li>
                <button onClick={logout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      <ThemeToggle />
    </header>
  );
}
 
export default Header;