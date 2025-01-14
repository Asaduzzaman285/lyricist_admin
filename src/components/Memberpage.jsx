import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table, Dropdown } from "react-bootstrap";


const MemberPage = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage] = useState(6);

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    image: null,
    name: "",
    bio: "",
    videoUrl: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [visibleUpdateButtons, setVisibleUpdateButtons] = useState({});

  useEffect(() => {
    fetch("/members.json")
      .then((response) => response.json())
      .then((data) => {
        setMembers(data);
        setFilteredMembers(data);
      })
      .catch((error) => console.error("Error fetching JSON data:", error));
  }, []);

  const handleFilter = () => {
    const term = searchTerm.toLowerCase();
    const filtered = members.filter(
      (member) =>
        member.name.toLowerCase().includes(term) ||
        member.bio.toLowerCase().includes(term)
    );
    setFilteredMembers(filtered);
    setCurrentPage(1); // Reset to the first page after filtering
  };

  const handleClearFilter = () => {
    setSearchTerm("");
    setFilteredMembers(members);
    setCurrentPage(1); // Reset to the first page after clearing
  };

  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(
    indexOfFirstMember,
    indexOfLastMember
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEdit = (member) => {
    setModalData({ ...member });
    setIsEditing(true);
    setEditingMemberId(member.id);
    setShowModal(true);
  };

  const handleAdd = () => {
    setModalData({
      image: null,
      name: "",
      bio: "",
      videoUrl: "",
    });
    setIsEditing(false);
    setEditingMemberId(null);
    setShowModal(true);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const { name, bio, videoUrl } = modalData;

    if (isEditing) {
      const updatedMembers = members.map((member) =>
        member.id === editingMemberId
          ? { ...member, name, bio, videoUrl }
          : member
      );
      setMembers(updatedMembers);
    } else {
      const newMember = {
        id: Date.now(),
        image: modalData.image,
        name,
        bio,
        videoUrl,
      };
      setMembers([...members, newMember]);
    }
    setShowModal(false);
    setEditingMemberId(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setModalData({ ...modalData, image: URL.createObjectURL(file) });
  };

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredMembers.length / membersPerPage); i++) {
      pageNumbers.push(i);
    }
    return (
      <ul className="pagination">
        {pageNumbers.map((number) => (
          <li
            key={number}
            className={`page-item ${currentPage === number ? "active" : ""}`}
          >
            <Button className="page-link" onClick={() => paginate(number)}>
              {number}
            </Button>
          </li>
        ))}
      </ul>
    );
  };

  const renderMemberRows = () => {
    return currentMembers.map((member) => (
      <tr key={member.id}>
        <td>
          <img
            src={member.image}
            alt={member.name}
            style={{ width: "50px", height: "50px", objectFit: "cover" }}
          />
        </td>
        <td>{member.name}</td>
        <td>{member.bio}</td>
        <td className="text-center">
          <Dropdown
            show={!!visibleUpdateButtons[member.id]}
            onToggle={(isOpen) =>
              setVisibleUpdateButtons((prevState) => ({
                ...prevState,
                [member.id]: isOpen,
              }))
            }
          >
            <Dropdown.Toggle
              variant="link"
              className="text-decoration-none p-0"
              id={`dropdown-${member.id}`}
            >
              <i className="fa-solid fa-ellipsis-vertical text-primary"></i>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() => handleEdit(member)}
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

  return (
    <div className="container mt-4" style={{ padding: "10%", marginLeft: "10%" }}>
      <h1>Member Page</h1>
      <Form.Group className="d-flex align-items-center mb-3">
        <Form.Control
          type="text"
          placeholder="Filter by name or bio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="me-2"
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
      </Form.Group>
      <Button variant="primary" onClick={handleAdd} className="mb-3">
        <i className="fa-solid fa-plus"></i> Create New Member
      </Button>
      <Table bordered>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Bio</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>{renderMemberRows()}</tbody>
      </Table>
      {renderPagination()}
      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Update Member" : "Create New Member"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleModalSubmit}>
            <Form.Group className="mb-3" controlId="formImage">
              <Form.Label>Upload Image</Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileChange}
                required={!isEditing}
              />
              {modalData.image && (
                <img
                  src={modalData.image}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "auto",
                    marginTop: "10px",
                    objectFit: "cover",
                  }}
                />
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={modalData.name}
                onChange={(e) =>
                  setModalData({ ...modalData, name: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBio">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter bio"
                value={modalData.bio}
                onChange={(e) =>
                  setModalData({ ...modalData, bio: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formVideoUrl">
              <Form.Label>Video URL</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter video URL"
                value={modalData.videoUrl}
                onChange={(e) =>
                  setModalData({ ...modalData, videoUrl: e.target.value })
                }
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {isEditing ? "Update" : "Add"} Member
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MemberPage;
