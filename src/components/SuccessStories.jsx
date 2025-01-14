import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Dropdown } from "react-bootstrap";
import axios from 'axios';  

// Modal Component
const UserModal = ({ show, handleClose, handleSubmit, modalData, setModalData, isEditing }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? "Update User" : "Create New User"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              value={modalData.name}
              onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={modalData.email}
              onChange={(e) => setModalData({ ...modalData, email: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPhone">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter phone"
              value={modalData.phone}
              onChange={(e) => setModalData({ ...modalData, phone: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formRole">
            <Form.Label>Role</Form.Label>
            <Form.Control
              as="select"
              value={modalData.role_ids}
              onChange={(e) => setModalData({ ...modalData, role_ids: [e.target.value] })}
              required
            >
              <option value="">Select role</option>
              <option value="1">Admin</option>
              <option value="2">PMO</option>
              <option value="3">Handset User</option>
            </Form.Control>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formStatus">
            <Form.Label>Status</Form.Label>
            <Form.Control
              as="select"
              value={modalData.status}
              onChange={(e) => setModalData({ ...modalData, status: e.target.value })}
              required
            >
              <option value="">Select status</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </Form.Control>
          </Form.Group>
          {!isEditing && (
            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={modalData.password}
                onChange={(e) => setModalData({ ...modalData, password: e.target.value })}
                required
              />
            </Form.Group>
          )}
          <Button variant="primary" type="submit">
            {isEditing ? "Update" : "Add"} User
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

// Main UserPage Component
const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(6);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ name: "", email: "", phone: "", role_ids: [], status: "", password: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  // State to track visibility of update buttons
  const [visibleUpdateButtons, setVisibleUpdateButtons] = useState({});

  // Fetch data from API
  useEffect(() => {
    console.log("Fetching data...");
    const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage
    console.log("Token:", token);
    axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    axios.post("http://192.168.1.177:84/api/v1/getAllUsers_p", {}, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      }
    })
    .then((response) => {
      console.log("Response received:", response);
      setUsers(response.data.data); // Adjusted to match your API response structure
      setFilteredUsers(response.data.data);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
  }, []);

  // Filter users
  const handleFilterChange = (e) => {
    setSearchTerm(e.target.value);
    const term = e.target.value.toLowerCase();
    const filtered = users.filter(
      (user) => user.name.toLowerCase().includes(term) || (user.phone && user.phone.toLowerCase().includes(term))
    );
    setFilteredUsers(filtered);
  };

  // Paginate users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Toggle visibility of update button
  const toggleUpdateButton = (userId) => {
    setVisibleUpdateButtons((prevState) => ({
      ...prevState,
      [userId]: !prevState[userId],
    }));
  };

  // Render user rows
  const renderUserRows = () => {
    return currentUsers.map((user) => (
      <tr key={user.id}>
        <td>{user.name}</td>
        <td>{user.phone}</td>
        <td>{user.email}</td>
        <td className="text-center">
          <Dropdown>
            <Dropdown.Toggle
              variant="link"
              className="text-decoration-none p-0"
              id={`dropdown-${user.id}`}
              onClick={() => toggleUpdateButton(user.id)}
            >
              <i className="fa-solid fa-ellipsis-vertical text-primary"></i>
            </Dropdown.Toggle>

            <Dropdown.Menu show={visibleUpdateButtons[user.id]}>
              <Dropdown.Item
                onClick={() => handleEdit(user)}
                className="text-primary"
              >
                Update
              </Dropdown.Item>
             
            </Dropdown.Menu>
          </Dropdown>
        </td>
      </tr>
    ));
  };
// Handle Add New User
const handleAdd = () => {
  setModalData({ name: "", email: "", phone: "", role_ids: [], status: "", password: "" });
  setIsEditing(false);
  setEditingUserId(null);
  setShowModal(true);
};

// Handle Edit
const handleEdit = (user) => {
  setModalData({
    ...user,
    role_ids: user.role_ids || [], // Ensure role_ids is set correctly
    password: "" // Clear password field when editing
  });
  setIsEditing(true);
  setEditingUserId(user.id);
  setShowModal(true);
};

// Handle Modal Submit
const handleModalSubmit = (e) => {
  e.preventDefault();
  const { id, name, email, phone, role_ids, status, password } = modalData;
  const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage

  if (isEditing) {
    // Update user logic
    axios.post(`http://192.168.1.177:84/api/v1/updateUser`, {
      id, 
      name,
      email,
      phone,
      role_ids,
      status
    }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Use the retrieved token
      }
    })
    .then((response) => {
      const updatedUsers = users.map((user) =>
        user.id === id ? { ...user, name, email, phone, role_ids, status } : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    })
    .catch((error) => {
      console.error('Error updating user:', error);
    });
  } else {
    // Add new user logic
    axios.post("http://192.168.1.177:84/api/v1/createUser", {
      name,
      email,
      phone,
      role_ids,
      status,
      password
    }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Use the retrieved token
      }
    })
    .then((response) => {
      const newUser = { id: response.data.id, name, email, phone, role_ids, status };
      setUsers([...users, newUser]);
      setFilteredUsers([...users, newUser]);
    })
    .catch((error) => {
      console.error('Error creating user:', error);
    });
  }

  setShowModal(false);
  setEditingUserId(null);
};
  // // Handle Delete
  // const handleDelete = (id) => {
  //   const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage
  //   axios.delete(`http://192.168.1.177:84/api/v1/deleteUser/${id}`, {
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Authorization": `Bearer ${token}` // Use the retrieved token
  //     }
  //   })
  //   .then(() => {
  //     const updatedUsers = users.filter((user) => user.id !== id);
  //     setUsers(updatedUsers);
  //     setFilteredUsers(updatedUsers);
  //   })
  //   .catch((error) => {
  //     console.error('Error deleting user:', error);
  //   });
  // };

  // Render Pagination
  // const renderPagination = () => {
  //   const pageNumbers = [];
  //   for (let i = 1; i <= Math.ceil(filteredUsers.length / usersPerPage); i++) {
  //     pageNumbers.push(i);
  //   }
  //   return (
  //     <ul className="pagination">
  //       {pageNumbers.map((number) => (
  //         <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
  //           <Button className="page-link" onClick={() => paginate(number)}>
  //             {number}
  //           </Button>
  //         </li>
  //       ))}
  //     </ul>
  //   );
  // };

  return (
    <div className="container mt-4" style={{ padding: '10%', marginLeft: '10%' }}>
      <h1>User Page</h1>
       <Form.Group className="d-flex align-items-center mb-3" style={{ width: "70%" }}>
        <Form.Control
          type="text"
          placeholder="Filter by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="me-2"
        />
        <Button
          variant="secondary"
          className="me-2 d-flex align-items-center"
          onClick={() => {
            const term = searchTerm.toLowerCase();
            const filtered = users.filter(
              (user) =>
                user.name.toLowerCase().includes(term) ||
                (user.phone && user.phone.toLowerCase().includes(term))
            );
            setFilteredUsers(filtered);
          }}
        >
          <i className="fa-solid fa-filter me-1"></i> Filter
        </Button>
        <Button
          variant="outline-danger"
          className="d-flex align-items-center"
          onClick={() => {
            setSearchTerm("");
            setFilteredUsers(users);
          }}
        >
          <i className="fa-solid fa-times me-1"></i> Clear
        </Button>
      </Form.Group>

      <Button variant="primary" onClick={handleAdd} className="mb-3">
        <i className="fa-solid fa-plus"></i> Create New User
      </Button>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>{renderUserRows()}</tbody>
      </table>
      {renderPagination()}
      <UserModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSubmit={handleModalSubmit}
        modalData={modalData}
        setModalData={setModalData}
        isEditing={isEditing}
      />
    </div>
  );
};

export default UserPage;