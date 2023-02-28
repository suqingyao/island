import { useRoutes } from 'react-router-dom';
import Index from '../../docs/guide/index';
import A from '../../docs/guide/A';
import B from '../../docs/B';

const routes = [
  {
    path: '/guide',
    element: <Index />
  },
  {
    path: '/guide/a',
    element: <A />
  },
  {
    path: '/b',
    element: <B />
  }
];

export const Content = () => {
  return useRoutes(routes);
};
