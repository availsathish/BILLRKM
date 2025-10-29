import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table } from 'react-bootstrap';

function Reports() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  useEffect(() => {
    // Load data from localStorage
    const storedInvoices = localStorage.getItem('invoices');
    if (storedInvoices) {
      setInvoices(JSON.parse(storedInvoices));
    }

    const storedPayments = localStorage.getItem('payments');
    if (storedPayments) {
      setPayments(JSON.parse(storedPayments));
    }

    const storedCustomers = localStorage.getItem('customers');
    if (storedCustomers) {
      setCustomers(JSON.parse(storedCustomers));
    }
  }, []);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value
    });
  };

  // Filter data based on selected date range and customer
  const filteredInvoices = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.invoiceDate);
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    endDate.setHours(23, 59, 59); // Include the entire end date

    const dateInRange = invoiceDate >= startDate && invoiceDate <= endDate;
    const customerMatch = selectedCustomerId ? invoice.customerDetails.id === selectedCustomerId : true;
    
    return dateInRange && customerMatch;
  });

  const filteredPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.date);
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    endDate.setHours(23, 59, 59); // Include the entire end date

    const dateInRange = paymentDate >= startDate && paymentDate <= endDate;
    const customerMatch = selectedCustomerId ? payment.customerId === selectedCustomerId : true;
    
    return dateInRange && customerMatch;
  });

  // Calculate totals
  const totalSales = filteredInvoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0);
  const totalPayments = filteredPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  const outstandingAmount = totalSales - totalPayments;

  // Generate customer-wise summary
  const customerSummary = customers.map(customer => {
    const customerInvoices = filteredInvoices.filter(
      invoice => invoice.customerDetails.id === customer.id
    );
    const customerPayments = filteredPayments.filter(
      payment => payment.customerId === customer.id
    );
    
    const totalInvoiceAmount = customerInvoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0);
    const totalPaymentAmount = customerPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const balance = totalInvoiceAmount - totalPaymentAmount;
    
    return {
      id: customer.id,
      name: customer.name,
      invoiceCount: customerInvoices.length,
      totalInvoiceAmount,
      totalPaymentAmount,
      balance
    };
  }).filter(summary => summary.invoiceCount > 0 || summary.totalPaymentAmount > 0);

  return (
    <Container className="py-4">
      <Card className="mb-4">
        <Card.Header as="h4" className="text-center bg-primary text-white">
          Reports
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Report Type</Form.Label>
                <Form.Select 
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="sales">Sales Report</option>
                  <option value="payments">Payments Report</option>
                  <option value="customer">Customer Summary</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control 
                  type="date" 
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control 
                  type="date" 
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Customer</Form.Label>
                <Form.Select 
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  <option value="">All Customers</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Summary Cards */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="text-center bg-light">
                <Card.Body>
                  <Card.Title>Total Sales</Card.Title>
                  <Card.Text className="h3">₹{totalSales.toFixed(2)}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center bg-light">
                <Card.Body>
                  <Card.Title>Total Payments</Card.Title>
                  <Card.Text className="h3">₹{totalPayments.toFixed(2)}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center bg-light">
                <Card.Body>
                  <Card.Title>Outstanding Amount</Card.Title>
                  <Card.Text className="h3">₹{outstandingAmount.toFixed(2)}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Report Tables */}
          {reportType === 'sales' && (
            <div>
              <h5 className="mb-3">Sales Report</h5>
              <Table striped bordered hover responsive>
                <thead className="bg-light">
                  <tr>
                    <th>#</th>
                    <th>Invoice No</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice, index) => (
                      <tr key={invoice.id}>
                        <td>{index + 1}</td>
                        <td>{invoice.invoiceNumber}</td>
                        <td>{invoice.invoiceDate}</td>
                        <td>{invoice.customerDetails.name}</td>
                        <td>₹{invoice.grandTotal.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">No data found</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-light">
                  <tr>
                    <td colSpan="4" className="text-end fw-bold">Total:</td>
                    <td className="fw-bold">₹{totalSales.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          )}

          {reportType === 'payments' && (
            <div>
              <h5 className="mb-3">Payments Report</h5>
              <Table striped bordered hover responsive>
                <thead className="bg-light">
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Invoice</th>
                    <th>Payment Mode</th>
                    <th>Reference</th>
                    <th>Amount</th>
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
                          <td>{payment.paymentMode}</td>
                          <td>{payment.reference || '-'}</td>
                          <td>₹{parseFloat(payment.amount).toFixed(2)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">No data found</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-light">
                  <tr>
                    <td colSpan="6" className="text-end fw-bold">Total:</td>
                    <td className="fw-bold">₹{totalPayments.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          )}

          {reportType === 'customer' && (
            <div>
              <h5 className="mb-3">Customer Summary</h5>
              <Table striped bordered hover responsive>
                <thead className="bg-light">
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Invoices</th>
                    <th>Total Sales</th>
                    <th>Total Payments</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {customerSummary.length > 0 ? (
                    customerSummary.map((summary, index) => (
                      <tr key={summary.id}>
                        <td>{index + 1}</td>
                        <td>{summary.name}</td>
                        <td>{summary.invoiceCount}</td>
                        <td>₹{summary.totalInvoiceAmount.toFixed(2)}</td>
                        <td>₹{summary.totalPaymentAmount.toFixed(2)}</td>
                        <td>₹{summary.balance.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">No data found</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}

          <div className="text-end mt-3">
            <Button variant="primary">
              Print Report
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Reports;