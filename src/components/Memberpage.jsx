import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Table, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import Select from 'react-select';
import Paginate from './Paginate'; // Assuming Paginate component is in a sibling folder

const MemberPage = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage] = useState(10); // Adjust as needed
  const [paginator, setPaginator] = useState({
    current_page: 1,
    total_pages: 1,
    previous_page_url: null,
    next_page_url: null,
    record_per_page: 10,
    current_page_items_count: 0,
    total_count: 0,
    pagination_last_page: 1
  });

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    image: null,
    name: "",
    bio: "",
    videoUrl: "",
    position: "",
    memberStatus: { value: "2", label: "Approved" }, // Default status
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [visibleUpdateButtons, setVisibleUpdateButtons] = useState({});
  
  const [filterOptions, setFilterOptions] = useState([]);
  const [memberStatusOptions, setMemberStatusOptions] = useState([]);

  const API_BASE_URL = "https://lyricistadminapi.wineds.com";

  useEffect(() => {
    fetchMembers();
    fetchFilterOptions();
  }, [currentPage]);

  const fetchMembers = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/members/list-paginate?page=${currentPage}&per_page=${membersPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = response.data;
      if (result.status === "success") {
        setMembers(result.data.data);
        setFilteredMembers(result.data.data);
        setPaginator(result.data.paginator);
      } else {
        console.error("Failed to fetch members:", result.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error("Unauthenticated. Clearing token and redirecting.");
        localStorage.removeItem("authToken");
        alert("Session expired. Please log in again.");
        window.location.href = "/login";
      } else {
        console.error("Error fetching members:", error);
      }
    }
  };

  // Toggle visibility of update button
  const toggleUpdateButton = (memberId) => {
    setVisibleUpdateButtons((prevState) => ({
      ...prevState,
      [memberId]: !prevState[memberId],
    }));
  };

  const fetchFilterOptions = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/members/filter-data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = response.data;
      if (result.status === "success") {
        setFilterOptions(result.data.name_list);
        setMemberStatusOptions(result.data.member_status_list);
      } else {
        console.error("Failed to fetch filter options:", result.message);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  // Handle filter change
  const handleFilterChange = (selectedOption) => {
    setSelectedMember(selectedOption);
  };

  // Handle filter
  const handleFilter = () => {
    if (selectedMember) {
      const filtered = members.filter(member => member.id === selectedMember.value);
      setFilteredMembers(filtered);
      setCurrentPage(1); // Reset to the first page after filtering
    }
  };

  // Handle clear filter
  const handleClearFilter = () => {
    setSelectedMember(null);
    setFilteredMembers(members);
    setCurrentPage(1); // Reset to the first page after clearing
  };

  const handleAdd = () => {
    setModalData({
      image: null,
      name: "",
      bio: "",
      videoUrl: "",
      position: "",
      memberStatus: { value: "2", label: "Approved" }, // Default status
    });
    setIsEditing(false);
    setEditingMemberId(null);
    setShowModal(true);
  };

  const handleEdit = (member) => {
    const correctedFilePath = member.file_path ? `${API_BASE_URL}${member.file_path.replace('//', '/')}` : null;
    const memberStatus = memberStatusOptions.find(status => status.value === member.member_status_id) || { value: "2", label: "Approved" };

    setModalData({
      image: correctedFilePath,
      name: member.name,
      bio: member.bio,
      videoUrl: member.youtube_url,
      position: member.position || "",
      memberStatus,
    });
    setIsEditing(true);
    setEditingMemberId(member.id);
    setShowModal(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
  
    const fileName = file.name.split('.')[0];
    const filePath = `uploads/modules/members/`;
  
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/file/file-upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          params: {
            file_name: fileName,
            file_path: filePath,
          },
        }
      );
  
      const result = response.data;
      if (result.status === "success") {
        const correctedFilePath = `${API_BASE_URL}/${filePath}${result.data.file_path.split('/').pop()}`;
        setModalData({ ...modalData, image: correctedFilePath });
      } else {
        console.error("File upload failed:", result.message);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    const { name, bio, videoUrl, image, position, memberStatus } = modalData;
  
    const apiEndpoint = isEditing
      ? `${API_BASE_URL}/api/v1/members/update`
      : `${API_BASE_URL}/api/v1/members/create`;
  
    const payload = {
      id: editingMemberId,
      name,
      bio,
      youtube_url: videoUrl,
      file_path: image ? image.replace(API_BASE_URL, '') : modalData.image,
      position,
      member_status_id: memberStatus.value,
    };
  
    try {
      const response = await axios({
        url: apiEndpoint,
        method: isEditing ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: payload,
      });
  
      const result = response.data;
      if (result.status === "success") {
        fetchMembers();
        setShowModal(false);
        setEditingMemberId(null);
      } else {
        console.error("Failed to save member:", result.message);
      }
    } catch (error) {
      console.error("Error saving member:", error);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    return (
      <Paginate
        paginator={paginator}
        currentPage={currentPage}
        pagechanged={handlePageChange}
      />
    );
  };

  const renderMemberRows = () => {
    return filteredMembers.map((member) => {
      const correctedFilePath = member.file_path ? `${API_BASE_URL}${member.file_path.replace('//', '/')}` : "";
      const memberStatus = memberStatusOptions.find(status => status.value === member.member_status_id)?.label || "Unknown";

      return (
        <tr key={member.id}>
          <td>
            <img
              src={correctedFilePath}
              alt={member.name}
              style={{ width: "50px", height: "50px", objectFit: "cover" }}
            />
          </td>
          <td>{member.name}</td>
          <td>{member.bio}</td>
          <td>{member.position}</td>
          <td>{memberStatus}</td>
                 <td className="text-center">
                              <Button variant="link" onClick={() => handleEdit(member)}>
                              <i class="fa-solid fa-pen-to-square text-dark"></i>
                              </Button>
                            </td>
          {/* <td className="text-center">
            <Dropdown>
              <Dropdown.Toggle
                variant="link"
                className="text-decoration-none p-0"
                id={`dropdown-${member.id}`}
                onClick={() => toggleUpdateButton(member.id)}
              >
                <i className="fa-solid fa-ellipsis-vertical text-primary"></i>
              </Dropdown.Toggle>

              <Dropdown.Menu show={visibleUpdateButtons[member.id]}>
                <Dropdown.Item
                  onClick={() => handleEdit(member)}
                  className="text-primary"
                >
                  Update
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </td> */}
        </tr>
      );
    });
  };

  return (
    <div className="container mt-5" style={{ padding: "10%", marginLeft: "10%", backgroundColor: 'aliceblue', minHeight: '100vh' }}>
      <h1>Members</h1>
      <div className="mb-3 d-flex align-items-center">
        <Select
          className="form-control me-2"
          placeholder="Search members..."
          value={selectedMember}
          onChange={handleFilterChange}
          options={members.map(member => ({ value: member.id, label: member.name }))}
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
      <Button variant="primary" onClick={handleAdd} className="mb-3">
        Create New Member
      </Button>
      <Table bordered>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Bio</th>
            <th>Position</th>
            <th>Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>{renderMemberRows()}</tbody>
      </Table>
      {paginator?.total_pages > 1 && renderPagination()}

      {/* Modal Component */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Update Member" : "Create New Member"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleModalSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Upload Image</Form.Label>
              {modalData.image && (
                <div className="mb-3">
                  <img
                    src={modalData.image}
                    alt="Current"
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                </div>
              )}
              <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={modalData.name}
                onChange={(e) =>
                  setModalData({ ...modalData, name: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={modalData.bio}
                onChange={(e) =>
                  setModalData({ ...modalData, bio: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Video URL</Form.Label>
              <Form.Control
                type="text"
                value={modalData.videoUrl}
                onChange={(e) =>
                  setModalData({ ...modalData, videoUrl: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Position</Form.Label>
              <Form.Control
                type="text"
                value={modalData.position}
                onChange={(e) =>
                  setModalData({ ...modalData, position: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Select
                value={modalData.memberStatus}
                onChange={(selectedOption) =>
                  setModalData({ ...modalData, memberStatus: selectedOption })
                }
                options={memberStatusOptions}
              />
            </Form.Group>

            <div className="text-end">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button type="submit" variant="primary" className="ms-2">
                {isEditing ? "Update Member" : "Create Member"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MemberPage;