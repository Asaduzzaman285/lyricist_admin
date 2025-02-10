import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const cardData = [
  { title: 'Users', path: '/admin/user', color: 'rgb(0, 51, 102)' },
  { title: 'Events', path: '/admin/events', color: 'rgb(51, 102, 153)' },
  { title: 'Members', path: '/admin/members', color: 'rgb(102, 153, 204)' },
  { title: 'Sliders', path: '/admin/sliders', color: 'rgb(153, 204, 255)' },

  { title: 'Content', path: '/admin/products', color: 'rgb(49, 84, 166)' },
  { title: 'Success Stories', path: '/admin/success_stories', color: 'rgb(108, 119, 183)' },
  { title: 'Ads', path: '/admin/ads', color: 'rgb(142, 141, 193)' },
  { title: 'Orders', path: '/admin/orders', color: 'rgb(174, 156, 167)' },
];


const InfoCard = ({ title, path, color }) => {
    const navigate = useNavigate();

    return (
        <div className="col-md-3 mb-4">
            <div 
                className="card h-100 text-white text-center" 
                style={{ backgroundColor: color, cursor: 'pointer' }} 
                onClick={() => navigate(path)}
            >
                <div className="card-body">
                    <h5 className="card-title">{title}</h5>
                </div>
            </div>
        </div>
    );
};

const Homepage = () => {
    return (
        <div className="container mt-4" style={{ padding: '10%', marginLeft: "10%", backgroundColor: 'aliceblue', minHeight: '100vh' }}>
            <h1 className="mb-4">Dashboard</h1>
            <div className="row">
                {cardData.map((card, index) => (
                    <InfoCard key={index} title={card.title} path={card.path} color={card.color} />
                ))}
            </div>
        </div>
    );
};

export default Homepage;
