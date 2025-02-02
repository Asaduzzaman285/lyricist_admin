import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

// Card Component
const InfoCard = ({ title, count }) => (
  <div className="col-md-4 mb-4">
    <div className="card h-100">
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{count}</p>
      </div>
    </div>
  </div>
);

// Homepage Component
const Homepage = () => {
  const [userStats, setUserStats] = useState({ users: 0, members: 0, contents: 0 });

  // Fetch data from users.json
  useEffect(() => {
    fetch('/users.json')
      .then(response => response.json())
      .then(data => {
        const usersCount = data.length; // Total number of users
        setUserStats({ ...userStats, users: usersCount });
      })
      .catch(error => console.error('Error fetching the users:', error));
  }, []);

  return (
    <div className="container mt-4" style={{ padding: '10%',backgroundColor:'aliceblue', marginLeft: '10%',minHeight: '100vh' }}>
      <h1>Dashboard</h1>
      </div>
  );
};

export default Homepage;
