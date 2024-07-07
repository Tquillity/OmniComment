import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="theme-toggle">
      <input
      type="checkbox"
      id="theme-toggle"
      className="theme-toggle-checkbox"
      checked={theme === 'dark'}
      onChange={toggleTheme}
    />
    <label htmlFor="theme-toggle" className="theme-toggle-label">
      <span className="theme-toggle-inner"/>
      <span className="theme-toggle-switch"/>
    </label>
  </div>
  );
};

export default ThemeToggle;