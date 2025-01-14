import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';  // Import axios for HTTP requests

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',  // Use lowercase 'email' to match the backend
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    try {
      axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
      axios.defaults.headers.post['Content-Type'] = 'application/json';
      const response = await axios.post('https://lyricistadminapi.wineds.com/api/v1/login', {
        email,
        password,
      });
  
      if (response.data.status === 'success') {
        localStorage.setItem('authToken', response.data.data.user.access_token);
        localStorage.setItem('userName', response.data.data.user.name); // Store the user's name
        navigate('/admin/home'); // Redirect to the default route
      } else {
        setError('Invalid email/username or password.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };
  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <form onSubmit={handleSubmit} className="shadow p-4 rounded" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4">Login</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email/Username</label>
          <input
            type="text"
            name="email"  // Ensure the name is lowercase
            id="email"    // Ensure the id is lowercase
            className="form-control"
            placeholder="Enter your email or username"
            value={formData.email}  // Make sure it's lowercase here as well
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            className="form-control"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">Login</button>

        <div className="text-center mt-3">
          <a href="/forgot-password" className="text-decoration-none">Forgot Password?</a>
        </div>
      </form>
    </div>
  );
};

export default Login;
