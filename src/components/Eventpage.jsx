import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Table, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import Select from 'react-select';
import Paginate from './Paginate'; // Assuming Paginate component is in a sibling folder

const EventPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(10); // Adjust as needed
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
    title: "",
    artist: "",
    date: "",
    description: "",
    location: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [visibleUpdateButtons, setVisibleUpdateButtons] = useState({});
  
  const API_BASE_URL = "https://lyricistadminapi.wineds.com";

  useEffect(() => {
    fetchEvents();
  }, [currentPage]);

  const fetchEvents = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/events/list-paginate?page=${currentPage}&per_page=${eventsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = response.data;
      if (result.status === "success") {
        setEvents(result.data.data);
        setFilteredEvents(result.data.data);
        setPaginator(result.data.paginator);
      } else {
        console.error("Failed to fetch events:", result.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error("Unauthenticated. Clearing token and redirecting.");
        localStorage.removeItem("authToken");
        alert("Session expired. Please log in again.");
        window.location.href = "/login";
      } else {
        console.error("Error fetching events:", error);
      }
    }
  };

  const toggleUpdateButton = (eventId) => {
    setVisibleUpdateButtons((prevState) => ({
      ...prevState,
      [eventId]: !prevState[eventId],
    }));
  };

  const handleFilterChange = (selectedOption) => {
    setSelectedEvent(selectedOption);
  };

  const handleFilter = () => {
    if (selectedEvent) {
      const filtered = events.filter(event => event.id === selectedEvent.value);
      setFilteredEvents(filtered);
      setCurrentPage(1); // Reset to the first page after filtering
    }
  };

  const handleClearFilter = () => {
    setSelectedEvent(null);
    setFilteredEvents(events);
    setCurrentPage(1); // Reset to the first page after clearing
  };

  const handleAdd = () => {
    setModalData({
      image: null,
      title: "",
      artist: "",
      date: "",
      description: "",
      location: "",
    });
    setIsEditing(false);
    setEditingEventId(null);
    setShowModal(true);
  };

  const handleEdit = (event) => {
    const correctedFilePath = event.file_path ? `${API_BASE_URL}${event.file_path.replace('//', '/')}` : null;
  
    setModalData({
      image: correctedFilePath,
      title: event.title,
      artist: event.artist,
      date: event.date,
      description: event.description,
      location: event.location,
    });
    setIsEditing(true);
    setEditingEventId(event.id);
    setShowModal(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
  
    const fileName = file.name.split('.')[0];
    const filePath = `uploads/modules/events/`;
  
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
    const { title, artist, date, description, location, image } = modalData;
  
    const apiEndpoint = isEditing
      ? `${API_BASE_URL}/api/v1/events/update`
      : `${API_BASE_URL}/api/v1/events/create`;
  
    const payload = {
      id: editingEventId,
      title,
      artist,
      date,
      description,
      location,
      file_path: image ? image.replace(API_BASE_URL, '') : modalData.image,
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
        fetchEvents();
        setShowModal(false);
        setEditingEventId(null);
      } else {
        console.error("Failed to save event:", result.message);
      }
    } catch (error) {
      console.error("Error saving event:", error);
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

  const renderEventRows = () => {
    return filteredEvents.map((event) => {
      const correctedFilePath = event.file_path ? `${API_BASE_URL}${event.file_path.replace('//', '/')}` : "";

      return (
        <tr key={event.id}>
          <td>
            <img
              src={correctedFilePath}
              alt={event.title}
              style={{ width: "50px", height: "50px", objectFit: "cover" }}
            />
          </td>
          <td>{event.title}</td>
          <td>{event.artist}</td>
          <td>{event.date}</td>
          <td>{event.description}</td>
          <td>{event.location}</td>
          <td className="text-center">
            <Dropdown>
              <Dropdown.Toggle
                variant="link"
                className="text-decoration-none p-0"
                id={`dropdown-${event.id}`}
                onClick={() => toggleUpdateButton(event.id)}
              >
                <i className="fa-solid fa-ellipsis-vertical text-primary"></i>
              </Dropdown.Toggle>

              <Dropdown.Menu show={visibleUpdateButtons[event.id]}>
                <Dropdown.Item
                  onClick={() => handleEdit(event)}
                  className="text-primary"
                >
                  Update
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="container" style={{ padding: "10%", marginLeft: "10%", backgroundColor: 'aliceblue' }}>
      <h1>Events</h1>
      <div className="mb-3 d-flex align-items-center">
        <Select
          className="form-control me-2"
          placeholder="Search events..."
          value={selectedEvent}
          onChange={handleFilterChange}
          options={events.map(event => ({ value: event.id, label: event.title }))}
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
        Create New Event
      </Button>
      <Table bordered>
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Artist</th>
            <th>Date</th>
            <th>Description</th>
            <th>Location</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>{renderEventRows()}</tbody>
      </Table>
      {paginator?.total_pages > 1 && renderPagination()}

      {/* Modal Component */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Update Event" : "Create New Event"}
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
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={modalData.title}
                onChange={(e) =>
                  setModalData({ ...modalData, title: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Artist</Form.Label>
              <Form.Control
                type="text"
                value={modalData.artist}
                onChange={(e) =>
                  setModalData({ ...modalData, artist: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={modalData.date}
                onChange={(e) =>
                  setModalData({ ...modalData, date: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={modalData.description}
                onChange={(e) =>
                  setModalData({ ...modalData, description: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                value={modalData.location}
                onChange={(e) =>
                  setModalData({ ...modalData, location: e.target.value })
                }
                required
              />
            </Form.Group>

            <div className="text-end">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button type="submit" variant="primary" className="ms-2">
                {isEditing ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EventPage;