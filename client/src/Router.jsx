import { createBrowserRouter } from 'react-router-dom';
import Layout from './pages/routes/Layout';
import NotFound from './pages/routes/NotFound';
import Home from './pages/Home';
import Login from './pages/Login';
import Blockchain from './pages/Blockchain';
import OmniComment from './pages/OmniComment';
import Trending from './pages/Trending';
import Register from './pages/Register';

const createRouter = () => {
  return createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: 'login',
          element: <Login />,
        },
        {
         path: 'blockchain',
         element: <Blockchain />,
        },
        {
          path: 'omnicomment',
          element: <OmniComment />,
        },
        {
          path: 'trending',
          element: <Trending />,
        },
        {
          path: 'register',
          element: <Register />,
        },
      ],
    },
  ]);
};

export default createRouter;