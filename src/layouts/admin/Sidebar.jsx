import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName'); // Retrieve the user's name

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    navigate('/login'); // Redirect to the login page
  };

  return (
    <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
      <div className="sb-sidenav-menu">
        <div className="nav">
          <Link className="nav-link" to="/admin/home">
            <div className="sb-nav-link-icon">
              <i className="fas fa-tachometer-alt"></i>
            </div>
            Dashboard
          </Link>
          <Link className="nav-link" to="/admin/user">
            <div className="sb-nav-link-icon">
              <i className="fas fa-tachometer-alt"></i>
            </div>
            Users
          </Link>
          <Link className="nav-link" to="/admin/sliders">
            <div className="sb-nav-link-icon">
              <i className="fas fa-tachometer-alt"></i>
            </div>
            Sliders
          </Link>
          <Link className="nav-link" to="/admin/ads">
            <div className="sb-nav-link-icon">
              <i className="fas fa-tachometer-alt"></i>
            </div>
            Ads
          </Link>
          <Link className="nav-link" to="/admin/orders">
            <div className="sb-nav-link-icon">
              <i className="fas fa-tachometer-alt"></i>
            </div>
            Orders
          </Link>
          <Link className="nav-link" to="/admin/members">
            <div className="sb-nav-link-icon">
              <i className="fas fa-tachometer-alt"></i>
            </div>
            Members
          </Link>
          <Link className="nav-link" to="/admin/events">
            <div className="sb-nav-link-icon">
              <i className="fas fa-tachometer-alt"></i>
            </div>
            Events
          </Link>
          <Link className="nav-link" to="/admin/products">
            <div className="sb-nav-link-icon">
              <i className="fas fa-tachometer-alt"></i>
            </div>
            Products
          </Link>
          {/* <Link className="nav-link" to="/admin/contents">
            <div className="sb-nav-link-icon">
              <i className="fas fa-tachometer-alt"></i>
            </div>
            Podcasts
          </Link> */}
          <Link className="nav-link" to="/admin/success_stories">
            <div className="sb-nav-link-icon">
              <i className="fas fa-tachometer-alt"></i>
            </div>
            Success Stories
          </Link>
          {/* <Link className="nav-link" to="/admin/contents">
            <div className="sb-nav-link-icon">
              <i className="fas fa-tachometer-alt"></i>
            </div>
            Ec Commitee
          </Link> */}
          
        </div>
      </div>
      {/* <div className="sb-sidenav-footer">
        <div className="small">Logged in as: {userName}</div>
        <button onClick={handleLogout} className="btn btn-link text-decoration-none">Logout</button>
      </div> */}
    </nav>
  );
};

export default Sidebar;