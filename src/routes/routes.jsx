import React from 'react';
import Homepage from '../components/Homepage'; // Correct path to Homepage component
import UserPage from '../components/UserPage';
import Memberpage from '../components/Memberpage';
import Eventpage from '../components/Eventpage';
import Contentpage from '../components/Contentpage';
import SuccessStories from '../components/SuccessStories';
import Sliders from '../components/Sliders';
import Ads from '../components/Ads';

const routes = [
  { path: '/admin/home', exact: true, name: 'Homepage', component: <Homepage /> },
  { path: '/admin/user', exact: true, name: 'Userpage', component: <UserPage /> },
  { path: '/admin/members', exact: true, name: 'Memberpage', component: <Memberpage /> },
  { path: '/admin/events', exact: true, name: 'Eventpage', component: <Eventpage /> },
  { path: '/admin/products', exact: true, name: 'Contentpage', component: <Contentpage /> },
  { path: '/admin/success_stories', exact: true, name: 'SuccessStories', component: <SuccessStories /> },
  { path: 'admin/sliders', exact: true, name: 'Sliders', component: <Sliders /> },
  { path: 'admin/ads', exact: true, name: 'Ads', component: <Ads /> },


];

export default routes;