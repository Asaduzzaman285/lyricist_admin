import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import Select from 'react-select';
import Paginate from './Paginate'; // Assuming Paginate component is in a sibling folder

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10); // Adjust as needed
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
  const [modalData, setModalData] = useState({});
  const [visibleUpdateButtons, setVisibleUpdateButtons] = useState({});
  
  const API_BASE_URL = "https://lyricistadminapi.wineds.com";

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/cart/list-paginate?page=${currentPage}&per_page=${ordersPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = response.data;
      if (result.status === "success") {
        setOrders(result.data.data);
        setFilteredOrders(result.data.data);
        setPaginator(result.data.paginator);
      } else {
        console.error("Failed to fetch orders:", result.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error("Unauthenticated. Clearing token and redirecting.");
        localStorage.removeItem("authToken");
        alert("Session expired. Please log in again.");
        window.location.href = "/login";
      } else {
        console.error("Error fetching orders:", error);
      }
    }
  };

  const toggleUpdateButton = (orderId) => {
    setVisibleUpdateButtons((prevState) => ({
      ...prevState,
      [orderId]: !prevState[orderId],
    }));
  };

  const handleFilterChange = (selectedOption) => {
    setSelectedOrder(selectedOption);
  };

  const handleFilter = () => {
    if (selectedOrder) {
      const filtered = orders.filter(order => order.id === selectedOrder.value);
      setFilteredOrders(filtered);
      setCurrentPage(1); 
    }
  };

  const handleClearFilter = () => {
    setSelectedOrder(null);
    setFilteredOrders(orders);
    setCurrentPage(1); 
  };

  const handleViewDetails = (order) => {
    setModalData(order);
    setShowModal(true);
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

  const renderOrderRows = () => {
    return filteredOrders.map((order) => (
      <tr key={order.id}>
        <td>{order.order_number}</td>
        <td>{order.name}</td>
        <td>{order.email}</td>
        <td>{order.phone}</td>
        <td>{order.total} TK</td>
        <td className="text-center">
          <Dropdown>
            <Dropdown.Toggle
              variant="link"
              className="text-decoration-none p-0"
              id={`dropdown-${order.id}`}
              onClick={() => toggleUpdateButton(order.id)}
            >
              <i className="fa-solid fa-ellipsis-vertical text-primary"></i>
            </Dropdown.Toggle>

            <Dropdown.Menu show={visibleUpdateButtons[order.id]}>
              <Dropdown.Item
                onClick={() => handleViewDetails(order)}
                className="text-primary"
              >
                View Details
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </td>
      </tr>
    ));
  };

  return (
    <div className="container" style={{ padding: "10%", marginLeft: "10%", backgroundColor: 'aliceblue', minHeight: '100vh' }}>
      <h1>Orders</h1>
      <div className="mb-3 d-flex align-items-center">
        <Select
          className="form-control me-2"
          placeholder="Search orders..."
          value={selectedOrder}
          onChange={handleFilterChange}
          options={orders.map(order => ({ value: order.id, label: order.order_number }))}
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
      <Table bordered>
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Total</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>{renderOrderRows()}</tbody>
      </Table>
      {paginator?.total_pages > 1 && renderPagination()}

      {/* Modal Component */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {modalData && (
            <>
              <p><strong>Order Number:</strong> {modalData.order_number}</p>
              <p><strong>Name:</strong> {modalData.name}</p>
              <p><strong>Email:</strong> {modalData.email}</p>
              <p><strong>Phone:</strong> {modalData.phone}</p>
              <p><strong>Shipping Address:</strong> {modalData.shipping_address}</p>
              <p><strong>Total:</strong> {modalData.total} TK</p>
              <h3>Order Details:</h3>
              <ul>
                {modalData.order_detail && modalData.order_detail.map(detail => (
                  <li key={detail.id}>
                    <p><strong>Product Name:</strong> {detail.product.name}</p>
                    <p><strong>Price:</strong> {detail.price} TK</p>
                    <p><strong>Quantity:</strong> {detail.qty}</p>
                    <p><strong>Total:</strong> {detail.total} TK</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Orders;