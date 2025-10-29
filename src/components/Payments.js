import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Card, Form, Modal } from 'react-bootstrap';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState({
    id: '',
    date: '',
    customerId: '',
    invoiceId: '',
    amount: '',
    paymentMode: 'Cash',
    reference: '',
    notes: ''
  });

  useEffect(() => {
    // Load payments from localStorage
    const storedPayments = localStorage.getItem('payments');
    if (storedPayments) {
      setPayments(JSON.parse(storedPayments));
    }

    // Load invoices from localStorage
    const storedInvoices = localStorage.getItem('invoices');
    if (storedInvoices) {
      setInvoices(JSON.parse(storedInvoices));
    }

    // Load customers from localStorage
    const storedCustomers = localStorage.getItem('customers');
    if (storedCustomers) {
      setCustomers(JSON.parse(storedCustomers));
    }
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPayment({
      id: '',
      date: '',
      customerId: '',
      invoiceId: '',
      amount: '',
      paymentMode: 'Cash',
      reference: '',
      notes: ''
    });
  };

  const handleShowModal = () => {
    setCurrentPayment({
      ...currentPayment,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPayment({
      ...currentPayment,
      [name]: value
    });
  };

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setCurrentPayment({
      ...currentPayment,
      customerId,
      invoiceId: '' // Reset invoice when customer changes
    });
  };

  const handleSavePayment = () => {
    if (!currentPayment.customerId || !currentPayment.amount || !currentPayment.date) {
      alert('Please fill all required fields');
      return;
    }

    const updatedPayments = [...payments];
    const paymentIndex = payments.findIndex(payment => payment.id === currentPayment.id);

    if (paymentIndex === -1) {
      // Add new payment
      updatedPayments.push(currentPayment);
    } else {
      // Update existing payment
      updatedPayments[paymentIndex] = currentPayment;
    }

    setPayments(updatedPayments);
    localStorage.setItem('payments', JSON.stringify(updatedPayments));
    handleCloseModal();
  };

  const handleDeletePayment = (id) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      const updatedPayments = payments.filter(payment => payment.id !== id);
      setPayments(updatedPayments);
      localStorage.setItem('payments', JSON.stringify(updatedPayments));
    }
  };

  const handleEditPayment = (payment) => {
    setCurrentPayment(payment);
    setShowModal(true);
  };

  const filteredPayments = payments.filter(payment => {
    const customer = customers.find(c => c.id === payment.customerId);
    const customerName = customer ? customer.name.toLowerCase() : '';
    const invoice = invoices.find(i => i.id === payment.invoiceId);
    const invoiceNumber = invoice ? invoice.invoiceNumber.toLowerCase() : '';
    
    return (
      customerName.includes(searchTerm.toLowerCase()) ||
      invoiceNumber.includes(searchTerm.toLowerCase()) ||
      payment.date.includes(searchTerm) ||
      payment.amount.toString().includes(searchTerm) ||
      payment.paymentMode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Get customer invoices based on selected customer
  const customerInvoices = invoices.filter(
    invoice => invoice.customerDetails.id === currentPayment.customerId
  );

  return (
    <Container className="py-4">
      <Card className="mb-4">
        <Card.Header as="h4" className="text-center bg-primary text-white">
          Payment Management
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={8}>
              <Form.Group>
                <Form.Control 
                  type="text" 
                  placeholder="Search payments..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="text-end">
              <Button variant="primary" onClick={handleShowModal}>
                Add New Payment
              </Button>
            </Col>
          </Row>

          <Table striped bordered hover responsive>
            <thead className="bg-light">
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Invoice</th>
                <th>Amount</th>
                <th>Payment Mode</th>
                <th>Reference</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment, index) => {
                  const customer = customers.find(c => c.id === payment.customerId);
                  const invoice = invoices.find(i => i.id === payment.invoiceId);
                  
                  return (
                    <tr key={payment.id}>
                      <td>{index + 1}</td>
                      <td>{payment.date}</td>
                      <td>{customer ? customer.name : 'Unknown'}</td>
                      <td>{invoice ? invoice.invoiceNumber : 'N/A'}</td>
                      <td>₹{parseFloat(payment.amount).toFixed(2)}</td>
                      <td>{payment.paymentMode}</td>
                      <td>{payment.reference || '-'}</td>
                      <td>
                        <Button 
                          variant="warning" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleEditPayment(payment)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleDeletePayment(payment.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">No payments found</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add/Edit Payment Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentPayment.id ? 'Edit Payment' : 'Add New Payment'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control 
                type="date" 
                name="date"
                value={currentPayment.date} 
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Customer</Form.Label>
              <Form.Select 
                name="customerId"
                value={currentPayment.customerId} 
                onChange={handleCustomerChange}
                required
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Invoice (Optional)</Form.Label>
              <Form.Select 
                name="invoiceId"
                value={currentPayment.invoiceId} 
                onChange={handleInputChange}
                disabled={!currentPayment.customerId}
              >
                <option value="">Select Invoice</option>
                {customerInvoices.map(invoice => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoiceNumber} - ₹{invoice.grandTotal.toFixed(2)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control 
                type="number" 
                name="amount"
                value={currentPayment.amount} 
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Mode</Form.Label>
              <Form.Select 
                name="paymentMode"
                value={currentPayment.paymentMode} 
                onChange={handleInputChange}
              >
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reference (Optional)</Form.Label>
              <Form.Control 
                type="text" 
                name="reference"
                placeholder="Cheque no., Transaction ID, etc."
                value={currentPayment.reference} 
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2}
                name="notes"
                value={currentPayment.notes} 
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSavePayment}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Payments;