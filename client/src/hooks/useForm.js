import { useState } from 'react';

const useForm = (initialState) => {
  const [state, setState] = useState(initialState);

  const handleChange = (e) => {
    setState(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  return [state, handleChange];
};

export default useForm;