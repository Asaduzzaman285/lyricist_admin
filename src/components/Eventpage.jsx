import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table, Dropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const EventPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(6);

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    image: null,
    eventName: "",
    artistName: "",
    eventDate: "",
    location: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  // Fetch events from the API
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/events")
      .then((response) => response.json())
      .then((data) => {
        setEvents(data);
        setFilteredEvents(data);
      })
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  const handleFilter = () => {
    const term = searchTerm.toLowerCase();
    const filtered = events.filter(
      (event) =>
        event.eventName.toLowerCase().includes(term) ||
        event.artistName.toLowerCase().includes(term) ||
        event.location.toLowerCase().includes(term)
    );
    setFilteredEvents(filtered);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setSearchTerm("");
    setFilteredEvents(events);
    setCurrentPage(1);
  };

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEdit = (event) => {
    setModalData({ ...event });
    setIsEditing(true);
    setEditingEventId(event.id);
    setShowModal(true);
  };

  const handleAdd = () => {
    setModalData({
      image: null,
      eventName: "",
      artistName: "",
      eventDate: "",
      location: "",
      description: "",
    });
    setIsEditing(false);
    setEditingEventId(null);
    setShowModal(true);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const { eventName, artistName, eventDate, location, description, image } = modalData;
  
    if (isEditing) {
      // For editing, send a PUT request to update the event
      fetch(`http://127.0.0.1:8000/api/events/${editingEventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventName, artistName, eventDate, location, description, image }),
      })
        .then((response) => response.json())
        .then((updatedEvent) => {
          // Update the event in the state without re-fetching
          const updatedEvents = events.map((event) =>
            event.id === updatedEvent.id ? updatedEvent : event
          );
          setEvents(updatedEvents);
          setFilteredEvents(updatedEvents);
          setShowModal(false);
          setEditingEventId(null);
        })
        .catch((error) => console.error("Error updating event:", error));
    } else {
      // For adding a new event, send a POST request
      fetch("http://127.0.0.1:8000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventName, artistName, eventDate, location, description, image }),
      })
        .then((response) => response.json())
        .then((newEvent) => {
          // Add the new event to the state
          setEvents([...events, newEvent]);
          setFilteredEvents([...filteredEvents, newEvent]);
          setShowModal(false);
        })
        .catch((error) => console.error("Error adding new event:", error));
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setModalData({ ...modalData, image: URL.createObjectURL(file) });
  };

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredEvents.length / eventsPerPage); i++) {
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

  const renderEventRows = () => {
    return currentEvents.map((event) => (
      <tr key={event.id}>
        <td>
          <img
            src={event.image}
            alt={event.eventName}
            style={{ width: "50px", height: "50px", objectFit: "cover" }}
          />
        </td>
        <td>{event.eventName}</td>
        <td>{event.artistName}</td>
        <td>{event.eventDate}</td>
        <td>{event.location}</td>
        <td>{event.description}</td>
        <td className="text-center">
          <Dropdown>
            <Dropdown.Toggle variant="link" className="text-decoration-none p-0">
              <i className="fa-solid fa-ellipsis-vertical text-primary"></i>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleEdit(event)} className="text-primary">
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
      <h1>Event Page</h1>
      <Form.Group className="d-flex align-items-center mb-3">
        <Form.Control
          type="text"
          placeholder="Filter by event name, artist, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="me-2"
        />
        <Button variant="secondary" className="me-2" onClick={handleFilter}>
          Filter
        </Button>
        <Button variant="outline-danger" onClick={handleClearFilter}>
          Clear
        </Button>
      </Form.Group>
      <Button variant="primary" onClick={handleAdd} className="mb-3">
        Create New Event
      </Button>
      <Table bordered>
        <thead>
          <tr>
            <th>Image</th>
            <th>Event Name</th>
            <th>Artist</th>
            <th>Date</th>
            <th>Location</th>
            <th>Description</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>{renderEventRows()}</tbody>
      </Table>
      {renderPagination()}
      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Update Event" : "Create New Event"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleModalSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter event name"
                value={modalData.eventName}
                onChange={(e) =>
                  setModalData({ ...modalData, eventName: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Artist Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter artist name"
                value={modalData.artistName}
                onChange={(e) =>
                  setModalData({ ...modalData, artistName: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Event Date</Form.Label>
              <Form.Control
                type="date"
                value={modalData.eventDate}
                onChange={(e) =>
                  setModalData({ ...modalData, eventDate: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter location"
                value={modalData.location}
                onChange={(e) =>
                  setModalData({ ...modalData, location: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description"
                value={modalData.description}
                onChange={(e) =>
                  setModalData({ ...modalData, description: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
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
            <Button variant="primary" type="submit">
              {isEditing ? "Update" : "Add"} Event
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EventPage;
