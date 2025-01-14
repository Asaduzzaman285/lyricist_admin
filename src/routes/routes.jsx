import React from 'react';
import Homepage from '../components/Homepage'; // Correct path to Homepage component
import UserPage from '../components/UserPage';
import Memberpage from '../components/Memberpage';
import Eventpage from '../components/Eventpage';
import Contentpage from '../components/Contentpage';

const routes = [
  { path: '/admin/home', exact: true, name: 'Homepage', component: <Homepage /> },
  { path: '/admin/user', exact: true, name: 'Userpage', component: <UserPage /> },
  { path: '/admin/members', exact: true, name: 'Memberpage', component: <Memberpage /> },
  { path: '/admin/events', exact: true, name: 'Eventpage', component: <Eventpage /> },
  { path: '/admin/contents', exact: true, name: 'Contentpage', component: <Contentpage /> },

];

export default routes;