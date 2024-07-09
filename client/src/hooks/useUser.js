// hooks/useUser.js
import { useState, useEffect } from 'react';
import { getUserInfo } from '../services/authServices';

export const useUser = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserInfo();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, []);

  return { user };
};