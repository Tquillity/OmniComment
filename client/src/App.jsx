// App.jsx
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import createRouter from './Router';


function App() {
  const router = createRouter();
  
  return (
    <RouterProvider router ={router}/>
  );
}

export default App;
