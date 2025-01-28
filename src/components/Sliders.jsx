import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Dropdown } from 'react-bootstrap';
import axios from 'axios';

const Sliders = () => {
  const [sliders, setSliders] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentSliderId, setCurrentSliderId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [visibleUpdateButtons, setVisibleUpdateButtons] = useState({});
  const [uploadedFilePath, setUploadedFilePath] = useState('');

  const API_BASE_URL = "https://lyricistadminapi.wineds.com";
  const filePath = `uploads/modules/home-main-slider/`;

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No authentication token found");
      return;
    }
  
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/home-main-slider/list-paginate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const result = response.data;
      if (result.status === "success") {
        setSliders(result.data.data || []);
      } else {
        console.error("Failed to fetch sliders:", result.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error("Unauthenticated. Clearing token and redirecting.");
        localStorage.removeItem("authToken");
        alert("Session expired. Please log in again.");
        window.location.href = "/login";
      } else {
        console.error("Error fetching sliders:", error);
      }
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    const fileName = selectedFile.name.split('.')[0];
    setFileName(fileName);

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
        const uploadedPath = `${API_BASE_URL}/${filePath}${result.data.file_path.split('/').pop()}`;
        setUploadedFilePath(uploadedPath);
      } else {
        console.error("File upload failed:", result.message);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFilePath || !fileName) return;

    try {
      const token = localStorage.getItem("authToken");
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/api/v1/home-main-slider/update`, { id: currentSliderId, file_name: fileName, file_path: uploadedFilePath }, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setIsEditing(false);
        setCurrentSliderId(null);
      } else {
        await axios.post(`${API_BASE_URL}/api/v1/home-main-slider/create`, { file_name: fileName, file_path: uploadedFilePath }, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      fetchSliders(); // Refresh the list after upload
      setShowModal(false);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleEdit = (id) => {
    setIsEditing(true);
    setCurrentSliderId(id);
    setShowModal(true);
  };

  const handleAdd = () => {
    setFile(null);
    setFileName('');
    setUploadedFilePath('');
    setIsEditing(false);
    setCurrentSliderId(null);
    setShowModal(true);
  };

  const toggleUpdateButton = (sliderId) => {
    setVisibleUpdateButtons((prevState) => ({
      ...prevState,
      [sliderId]: !prevState[sliderId],
    }));
  };

  return (
    <div className="container" style={{ padding: '10%', marginLeft: '10%', backgroundColor: 'aliceblue', overflowX: 'hidden',minHeight: '100vh' }}>
      <h1>Sliders</h1>
      <Button variant="primary" onClick={handleAdd} className="mb-3">
        Create New Slider
      </Button>
      <Table bordered>
        <thead>
          <tr>
            <th>Image</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sliders.length > 0 ? (
            sliders.map((slider) => (
              <tr key={slider.id}>
                <td>
                  <img src={`${slider.file_path}`} alt={slider.file_name} width="100" />
                </td>
                <td className="text-center">
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="link"
                      className="text-decoration-none p-0"
                      id={`dropdown-${slider.id}`}
                      onClick={() => toggleUpdateButton(slider.id)}
                    >
                      <i className="fa-solid fa-ellipsis-vertical text-primary"></i>
                    </Dropdown.Toggle>

                    <Dropdown.Menu show={visibleUpdateButtons[slider.id]}>
                      <Dropdown.Item
                        onClick={() => handleEdit(slider.id)}
                        className="text-primary"
                      >
                        Update
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">No sliders available</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal Component */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Update Slider" : "Create New Slider"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }}>
            <div className="mb-3">
              <label htmlFor="fileInput" className="form-label">Upload Image</label>
              <input type="file" className="form-control" id="fileInput" onChange={handleFileChange} required />
            </div>
            <div className="text-end">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button type="submit" variant="primary" className="ms-2">
                {isEditing ? "Update Slider" : "Create Slider"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Sliders;