import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import routes from '../../routes/routes';
import '../../assets/admin/css/styles.css';
import '../../assets/admin/js/scripts.js';

const Master = () => {
  return (
    <div className="sb-nav-fixed">
      <Navbar />
      <div id="layoutSidenav">
        <div id="layoutSidenav_nav">
          <Sidebar />
        </div>
      </div>
      <div className="layoutSidenav_content">
        <main>
          <Routes>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={route.component}
              />
            ))}
            <Route path="*" element={<Navigate to="/admin/home" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Master;