import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Dropdown } from "react-bootstrap";
import Select from 'react-select';
import axios from 'axios';
import Paginate from './Paginate'; // Import the Paginate component

// Modal Component
const UserModal = ({ show, handleClose, handleSubmit, modalData, setModalData, isEditing, roles }) => {
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
              value={modalData.role_ids[0] || ""}
              onChange={(e) => setModalData({ ...modalData, role_ids: [e.target.value] })}
              required
            >
              <option value="">Select role</option>
              {roles.length > 0 ? (
                roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))
              ) : (
                <option value="">No roles available</option>
              )}
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [paginator, setPaginator] = useState({
    current_page: 1,
    total_pages: 1,
    previous_page_url: null,
    next_page_url: null,
    record_per_page: 5,
    current_page_items_count: 0,
    total_count: 0,
    pagination_last_page: 1
  });
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ name: "", email: "", phone: "", role_ids: [], status: "", password: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  // State to track visibility of update buttons
  const [visibleUpdateButtons, setVisibleUpdateButtons] = useState({});

  // Fetch data from API
  useEffect(() => {
    getUsersData(currentPage); 
    getRolesData(); // Fetch roles data
  }, [currentPage]); 

  const getUsersData = (page = 1) => {
    console.log("Fetching data...");
    const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage

    if (!token) {
      console.error('No authentication token found');
      return;
    }

    axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    axios.post(`https://lyricistadminapi.wineds.com/api/v1/getAllUsers_p?page=${page}`, {}, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        }
    })
    .then((response) => {
        console.log("Response received:", response);
        if (response.data.data && response.data.data.data && response.data.data.paginator) {
            setUsers(response.data.data.data);
            setFilteredUsers(response.data.data.data);
            setPaginator(response.data.data.paginator); // Set paginator data
        } else {
            console.error('Invalid data format', response.data);
        }
        console.log("Response received:", response);
        if (response.data.data && response.data.data.data && response.data.data.paginator) {
            setUsers(response.data.data.data);
            setFilteredUsers(response.data.data.data);
            setPaginator(response.data.data.paginator); // Set paginator data
        } else {
            console.error('Invalid data format', response.data);
        }
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
        console.error('Error fetching data:', error);
    });
  };

  const getRolesData = async () => {
    const token = localStorage.getItem('authToken');
    console.log("Fetching roles...:", token);
    if (!token) {
      console.error('No authentication token found');
      return;
    }
    try {
      const response = await axios.post('https://lyricistadminapi.wineds.com/api/v1/role/getAllRoles', {}, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      console.log("Roles received:", response.data);
      if (response.data.status === "success" && response.data.data && response.data.data.rolelist) {
        setRoles(response.data.data.rolelist);
      } else {
        console.error("Invalid roles format", response.data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  // Handle filter change
  const handleFilterChange = (selectedOption) => {
    setSelectedUser(selectedOption);
  };

  // Handle filter
  const handleFilter = () => {
    if (selectedUser) {
      const filtered = users.filter(user => user.id === selectedUser.value);
      setFilteredUsers(filtered);
      setCurrentPage(1); // Reset to the first page after filtering
    }
  };

  // Handle clear filter
  const handleClearFilter = () => {
    setSelectedUser(null);
    setFilteredUsers(users);
    setCurrentPage(1); // Reset to the first page after clearing
  };

  // Toggle visibility of update button
  const toggleUpdateButton = (userId) => {
    setVisibleUpdateButtons((prevState) => ({
      ...prevState,
      [userId]: !prevState[userId],
    }));
  };

  // Render user rows
  const renderUserRows = () => {
    console.log('Rendering user rows...');
    if (!Array.isArray(filteredUsers) || filteredUsers.length === 0) {
        console.log('No users found');
        return <tr><td colSpan="5">No users found</td></tr>;
    }
    console.log('Rendering user rows...');
    if (!Array.isArray(filteredUsers) || filteredUsers.length === 0) {
        console.log('No users found');
        return <tr><td colSpan="5">No users found</td></tr>;
    }
    return filteredUsers.map((user, i) => (
      <tr key={user.id}>
      <td>{paginator.current_page > 1 ? ((paginator.current_page - 1) * paginator.record_per_page) + i + 1 : i + 1}</td>
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
  role_ids: user.roles.map(role => role.id) || [],
  password: "" 
});
setIsEditing(true);
setEditingUserId(user.id);
setShowModal(true);
};

// Handle Modal Submit
const handleModalSubmit = (e) => {
e.preventDefault();
const { id, name, email, phone, role_ids, status, password } = modalData;
const token = localStorage.getItem('authToken'); 
if (isEditing) {
  // Update user logic
  axios.post(`https://lyricistadminapi.wineds.com/api/v1/updateUser`, {
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
  axios.post("https://lyricistadminapi.wineds.com/api/v1/createUser", {
    name, 
    email, 
    phone, 
    role_ids, 
    status, 
    password
  }, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  })
  .then((response) => {
    const newUser = response.data.data;
    setUsers([newUser, ...users]);
    setFilteredUsers([newUser, ...users]);
  })
  .catch((error) => {
    console.error('Error adding user:', error);
  });
}

handleClose();
};

// Close Modal
const handleClose = () => setShowModal(false);

return (
<div className="container" style={{ padding: '10%', marginLeft: '10%', backgroundColor: 'aliceblue', overflowX: 'hidden' }}>
  <h1>Users</h1>
  <div className="mb-3 d-flex align-items-center">
    <Select
      className="form-control me-2"
      placeholder="Search users..."
      value={selectedUser}
      onChange={handleFilterChange}
      options={users.map(user => ({ value: user.id, label: user.name }))}
    />
    <Button
      variant="secondary"
      className="me-2 d-flex align-items-center"
      onClick={handleFilter}
    >
      <i className="fa-solid fa-filter me-1"></i> Filter
    </Button>
    <Button
      variant="outline-danger"
      className="d-flex align-items-center"
      onClick={handleClearFilter}
    >
      <i className="fa-solid fa-times me-1"></i> Clear
    </Button>
  </div>
  
  <Button onClick={handleAdd} variant="primary" className="mt-1">
    Add New User
  </Button>
  <table className="table table-bordered mt-1 ">
    <thead>
      <tr>
        <th>#</th>
        <th>Name</th>
        <th>Phone</th>
        <th>Email</th>
        <th className="text-center">Actions</th>
      </tr>
    </thead>
    <tbody>
      {renderUserRows()}
    </tbody>
  </table>

  {paginator?.total_pages > 1 && (
    <Paginate
      paginator={paginator}
      currentPage={currentPage}
      pagechanged={(page) => setCurrentPage(page)}
    />
  )}

  <UserModal
    show={showModal}
    handleClose={handleClose}
    handleSubmit={handleModalSubmit}
    modalData={modalData}
    setModalData={setModalData}
    isEditing={isEditing}
    roles={roles} 
  />
</div>
);
};

export default UserPage;
