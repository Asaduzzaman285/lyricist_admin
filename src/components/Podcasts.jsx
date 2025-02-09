import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
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
  const [shipmentStatus, setShipmentStatus] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [orderStatus, setOrderStatus] = useState("Processing");
  const [deliveryCharge, setDeliveryCharge] = useState(80);
  const [paidAmount, setPaidAmount] = useState(0);

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

  // Calculate payment status based on paid amount and total
  const calculatePaymentStatus = (paidAmount, total) => {
    if (paidAmount === 0) return 1; // Unpaid
    if (paidAmount === total) return 2; // Paid
    if (paidAmount > 0 && paidAmount < total) return 3; // Partially Paid
    return 1; // Default to Unpaid
  };

  // Get payment status label
  const getPaymentStatusLabel = (statusId) => {
    switch (statusId) {
      case 1: return "Unpaid";
      case 2: return "Paid";
      case 3: return "Partially Paid";
      default: return "Unpaid";
    }
  };

  // Get payment status badge class
  const getPaymentStatusBadgeClass = (statusId) => {
    switch (statusId) {
      case 1: return "badge bg-danger text-white";
      case 2: return "badge bg-success text-white";
      case 3: return "badge bg-warning text-dark";
      default: return "badge bg-danger text-white";
    }
  };

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
        // Add "Partially Paid" to payment status list if not exists
        const updatedPaymentStatusList = [...response.data.data.payment_status_list];
        if (!updatedPaymentStatusList.find(status => status.value === 3)) {
          updatedPaymentStatusList.push({ value: 3, label: "Partially Paid" });
        }
        setFilterData({
          ...response.data.data,
          payment_status_list: updatedPaymentStatusList
        });
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

      if (selectedOrder?.value) params.append('order_number', selectedOrder.label);
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
        
        // Calculate correct payment status for each order
        const updatedData = data.map(order => ({
          ...order,
          total: Number(order.sub_total) + Number(order.delivery_charge),
          payment_status: calculatePaymentStatus(
            Number(order.paid_amount),
            Number(order.sub_total) + Number(order.delivery_charge)
          )
        }));

        setOrders(updatedData);
        setFilteredOrders(updatedData);
        setPaginator(paginatorData);
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleViewDetails = (order) => {
    const total = Number(order.sub_total) + Number(order.delivery_charge);
    setModalData(order);
    setShipmentStatus(
      filterData.shipment_status_list.find(
        status => status.value === order.shipment_status_id
      )?.label || ""
    );
    setPaymentStatus(getPaymentStatusLabel(order.payment_status));
    setOrderStatus(
      filterData.order_status_list.find(
        status => status.value === order.order_status_id
      )?.label || "Processing"
    );
    setDeliveryCharge(order.delivery_charge || 80);
    setPaidAmount(order.paid_amount || 0);
    setShowModal(true);
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      handleAuthError();
      return;
    }

    const totalAmount = Number(modalData.sub_total) + Number(deliveryCharge);
    const paymentStatusId = calculatePaymentStatus(Number(paidAmount), totalAmount);

    const updatedData = {
      id: modalData.id,
      shipment_status_id: filterData.shipment_status_list.find(
        status => status.label === shipmentStatus
      )?.value || null,
      order_status_id: filterData.order_status_list.find(
        status => status.label === orderStatus
      )?.value || null,
      payment_status_id: paymentStatusId,
      paid_amount: paidAmount,
      due: totalAmount - paidAmount,
      delivery_charge: deliveryCharge,
      payment_method_id: modalData.payment_method_id,
      total: totalAmount
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
        fetchOrders(); // Refresh the orders list
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  // ... (keep other utility functions like handleAuthError, handleApiError, etc.)

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
          <div>Total: {Number(order.sub_total) + Number(order.delivery_charge)} TK</div>
          <div>Due: {(Number(order.sub_total) + Number(order.delivery_charge)) - Number(order.paid_amount)} TK</div>
          <div>Paid Amount: {order.paid_amount} TK</div>
          <div>
            <span className={getPaymentStatusBadgeClass(order.payment_status)}>
              {getPaymentStatusLabel(order.payment_status)}
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
            <i className="fa-solid fa-pen-to-square text-dark"></i>
          </Button>
        </td>
      </tr>
    ));
  };

  return (
    <div className="container" style={{ padding: "10%", marginLeft: "10%", backgroundColor: 'aliceblue', minHeight: '100vh' }}>
      <h1>Orders</h1>
      {/* Keep existing filter UI code */}
      
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
              
              <Table bordered>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {modalData.order_detail && modalData.order_detail.map(detail => (
                    <tr key={detail.id}>
                      <td>{detail.product.name}</td>
                      <td>{detail.price} TK</td>
                      <td>{detail.qty}</td>
                      <td>{detail.price * detail.qty} TK</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <p><strong>Subtotal:</strong> {modalData.sub_total} TK</p>
              <Form.Group className="mb-3">
                <Form.Label>Delivery Charge</Form.Label>
                <Form.Control 
                  type="number" 
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                />
                </Form.Group>
              <p><strong>Total:</strong> {Number(modalData.sub_total) + Number(deliveryCharge)} TK</p>

              <Form.Group className="mb-3">
                <Form.Label>Paid Amount</Form.Label>
                <Form.Control 
                  type="number" 
                  value={paidAmount}
                  onChange={(e) => {
                    const newPaidAmount = Number(e.target.value);
                    setPaidAmount(newPaidAmount);
                    const total = Number(modalData.sub_total) + Number(deliveryCharge);
                    const newPaymentStatus = calculatePaymentStatus(newPaidAmount, total);
                    setPaymentStatus(getPaymentStatusLabel(newPaymentStatus));
                  }}
                />
              </Form.Group>

              <div className="payment-summary">
                <p><strong>Due:</strong> {Math.max(0, Number(modalData.sub_total) + Number(deliveryCharge) - Number(paidAmount))} TK</p>
                <p>
                  <strong>Payment Status: </strong>
                  <span className={getPaymentStatusBadgeClass(calculatePaymentStatus(
                    Number(paidAmount),
                    Number(modalData.sub_total) + Number(deliveryCharge)
                  ))}>
                    {paymentStatus}
                  </span>
                </p>
              </div>

              <div className="alert alert-info mt-3">
                <small>
                  <i className="fas fa-info-circle me-2"></i>
                  Payment status is automatically calculated based on the paid amount:
                  <ul className="mb-0 mt-1">
                    <li>Unpaid: When no payment is made</li>
                    <li>Partially Paid: When some payment is made but there's still a due amount</li>
                    <li>Paid: When the full amount is paid</li>
                  </ul>
                </small>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdate}
            disabled={Number(paidAmount) > Number(modalData.sub_total) + Number(deliveryCharge)}
          >
            Update Order
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Orders;