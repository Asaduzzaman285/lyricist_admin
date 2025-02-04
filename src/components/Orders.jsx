import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Dropdown, Form } from 'react-bootstrap';
import axios from 'axios';
import Select from 'react-select';
import Paginate from './Paginate';

const Orders = () => {
  // Base states
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
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

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const [visibleUpdateButtons, setVisibleUpdateButtons] = useState({});
  const [shipmentStatus, setShipmentStatus] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [orderStatus, setOrderStatus] = useState("Processing");

  // Filter states
  const [filterData, setFilterData] = useState({
    order_number_list: [],
    payment_method_list: [],
    payment_status_list: [],
    order_status_list: [],
    shipment_status_list: []
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(null);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState(null);
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const API_BASE_URL = "https://lyricistadminapi.wineds.com";


  useEffect(() => {
    fetchOrders();
    fetchFilterData();
  }, [currentPage]);

  const fetchFilterData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      handleAuthError();
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/cart/filter-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === "success") {
        setFilterData(response.data.data);
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      handleAuthError();
      return;
    }

    try {

      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('per_page', ordersPerPage);

      console.log('Selected Order:', selectedOrder);


      if (selectedOrder?.value) {
        params.append('order_number', selectedOrder.label); 
      }
      if (orderStatusFilter) params.append('order_status_id', orderStatusFilter.value);
      if (paymentStatusFilter) params.append('payment_status_id', paymentStatusFilter.value);
      if (paymentMethodFilter) params.append('payment_method_id', paymentMethodFilter.value);
      if (shipmentStatusFilter) params.append('shipment_status_id', shipmentStatusFilter.value);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await axios.get(
        `${API_BASE_URL}/api/v1/cart/list-paginate?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.status === "success") {
        const { data, paginator: paginatorData } = response.data.data;
        setOrders(data);
        setFilteredOrders(data);
        setPaginator(paginatorData);
      }
    } catch (error) {
      handleApiError(error);
    }
  };


  const handleFilter = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  const handleClearFilter = () => {
    setSelectedOrder(null);
    setOrderStatusFilter(null);
    setPaymentStatusFilter(null);
    setPaymentMethodFilter(null);
    setShipmentStatusFilter(null);
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    fetchOrders();
  };

  // Modal handling
  const handleViewDetails = (order) => {
    setModalData(order);
    setShipmentStatus(
      filterData.shipment_status_list.find(
        status => status.value === order.shipment_status_id
      )?.label || ""
    );
    setPaymentStatus(order.payment_status === 2 ? "Paid" : "Unpaid");
    setOrderStatus(
      filterData.order_status_list.find(
        status => status.value === order.order_status_id
      )?.label || "Processing"
    );
    setShowModal(true);
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      handleAuthError();
      return;
    }

    const updatedData = {
      id: modalData.id,
      shipment_status_id: filterData.shipment_status_list.find(
        status => status.label === shipmentStatus
      )?.value || null,
      order_status_id: filterData.order_status_list.find(
        status => status.label === orderStatus
      )?.value || null,
      payment_status_id: paymentStatus === "Paid" ? 2 : 1,
      paid_amount: paymentStatus === "Paid" ? modalData.total : 0,
      due: paymentStatus === "Paid" ? 0 : modalData.total,
      payment_method_id: modalData.payment_method_id,
    };

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/cart/update`,
        updatedData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json" 
          }
        }
      );

      if (response.data.status === "success") {
        alert("Order updated successfully!");
        setShowModal(false);
        fetchOrders(); 
      }
    } catch (error) {
      handleApiError(error);
    }
  };


  const handleAuthError = () => {
    localStorage.removeItem("authToken");
    alert("Please log in to continue.");
    window.location.href = "/login";
  };

  const handleApiError = (error) => {
    if (error.response?.status === 401) {
      handleAuthError();
    } else {
      console.error("API Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const toggleUpdateButton = (orderId) => {
    setVisibleUpdateButtons(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderOrderRows = () => {
    return filteredOrders.map((order) => (
      <tr key={order.id} style={{ fontSize: '12px' }}>
        <td>{order.order_number}</td>
        <td>
          <div>Name: {order.name}</div>
          <div>Email: {order.email}</div>
          <div>Phone: {order.phone}</div>
          <div>Address: {order.shipping_address}</div>
        </td>
        <td>
          <div>Subtotal: {order.sub_total} TK</div>
          <div>Delivery Charge: {order.delivery_charge} TK</div>
          <div>Total: {order.total} TK</div>
          <div>Due: {order.due} TK</div>
          <div>Paid Amount: {order.paid_amount} TK</div>
          <div>
            <span className={order.payment_status === 1 ? "badge bg-warning text-dark" : "badge bg-success text-white"}>
              {order.payment_status === 1 ? "Unpaid" : "Paid"}
            </span>
          </div>
        </td>
        <td>
          {order.order_detail.map(detail => (
            <div key={detail.id}>{detail.product.name} x {detail.qty}</div>
          ))}
        </td>
        <td>
          <Table bordered className="table-sm">
            <tbody>
              {filterData.order_status_list.map(status => (
                <tr key={status.value}>
                  <td>{status.label}</td>
                  {status.value <= order.order_status_id && (
                    <td>
                      <i className="fa-regular fa-circle-check" style={{ color: "green" }}></i>
                    </td>
                  )}
                </tr>
              ))}
       
            </tbody>
          </Table>
        </td>
        <td>
          {filterData.shipment_status_list.find(
            status => status.value === order.shipment_status_id
          )?.label || "Pending"}
        </td>
           <td className="text-center">
                            <Button variant="link" onClick={() => handleViewDetails(order)}>
                            <i class="fa-solid fa-pen-to-square text-dark"></i>
                            </Button>
                          </td>
        
      </tr>
    ));
  };

  return (
    <div className="container" style={{ padding: "10%", marginLeft: "10%", backgroundColor: 'aliceblue', minHeight: '100vh' }}>
      <h1>Orders</h1>
      <div className="mb-3 d-flex flex-column">
  <div className="d-flex align-items-center mb-2">
    <Select
      className="form-control me-2"
      placeholder="Search orders..."
      value={selectedOrder}
      onChange={setSelectedOrder}
      options={filterData.order_number_list}
      isClearable
    />
    <Select
      className="form-control me-2"
      placeholder="Order Status"
      value={orderStatusFilter}
      onChange={setOrderStatusFilter}
      options={filterData.order_status_list}
      isClearable
    />
  </div>

  <div className="d-flex align-items-center mb-2">
    <Select
      className="form-control me-2"
      placeholder="Payment Status"
      value={paymentStatusFilter}
      onChange={setPaymentStatusFilter}
      options={filterData.payment_status_list}
      isClearable
    />
    <Select
      className="form-control me-2"
      placeholder="Payment Method"
      value={paymentMethodFilter}
      onChange={setPaymentMethodFilter}
      options={filterData.payment_method_list}
      isClearable
    />
    <Select
      className="form-control me-2"
      placeholder="Shipment Status"
      value={shipmentStatusFilter}
      onChange={setShipmentStatusFilter}
      options={filterData.shipment_status_list}
      isClearable
    />
  </div>

  <div className="row mb-2">
    <div className="col-md-4">
      <Form.Control
        type="date"
        className="form-control me-2"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
    </div>
    <div className="col-md-4">
      <Form.Control
        type="date"
        className="form-control me-2"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
    </div>
    <div className="col-md-4 d-flex align-items-center">
      <Button
        variant="secondary"
        className="me-2 rounded shadow btn-md d-flex align-items-center"
        style={{ backgroundImage: 'linear-gradient(45deg, #007bff, #0056b3)' }}
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
  </div>
</div>

      {/* Orders Table */}
      <Table bordered className="table-striped table-hover">
        <thead>
          <tr>
            <th>Order Number</th>
            <th style={{ width: "80px" }}>Customer Info</th>
            <th style={{ width: "200px" }}>Payment Info</th>
            <th style={{ width: "60px" }}>Order Details</th>
            <th>Order Status</th>
            <th>Shipment Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>{renderOrderRows()}</tbody>
      </Table>

      {/* Pagination */}
      {paginator?.total_pages > 1 && (
        <Paginate
          paginator={paginator}
          currentPage={currentPage}
          pagechanged={handlePageChange}
        />
      )}

      {/* Update Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Order</Modal.Title>
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
              
              <Form.Group className="mb-3">
                <Form.Label>Shipment Status</Form.Label>
                <Form.Control 
                  as="select" 
                  value={shipmentStatus}
                  onChange={(e) => setShipmentStatus(e.target.value)}
                >
                    {filterData.shipment_status_list.map(status => (
                    <option key={status.value} value={status.label}>{status.label}</option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Payment Status</Form.Label>
                <Form.Control 
                  as="select" 
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                >
                  {filterData.payment_status_list.map(status => (
                    <option key={status.value} value={status.label}>{status.label}</option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Order Status</Form.Label>
                <Form.Control 
                  as="select" 
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                >
                  {filterData.order_status_list.map(status => (
                    <option key={status.value} value={status.label}>{status.label}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Update Order
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Orders;