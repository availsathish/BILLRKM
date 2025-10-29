import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Card, Form } from 'react-bootstrap';

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load invoices from localStorage
    const storedInvoices = localStorage.getItem('invoices');
    if (storedInvoices) {
      setInvoices(JSON.parse(storedInvoices));
    }
  }, []);

  const handleDeleteInvoice = (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      const updatedInvoices = invoices.filter(invoice => invoice.id !== id);
      setInvoices(updatedInvoices);
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    }
  };

  const handleViewInvoice = (invoice) => {
    // This would typically navigate to the invoice view or open a modal
    alert(`View Invoice: ${invoice.invoiceNumber}`);
  };

  const handlePrintInvoice = (invoice) => {
    // This would typically open the print dialog or generate a PDF
    alert(`Print Invoice: ${invoice.invoiceNumber}`);
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceDate.includes(searchTerm)
  );

  return (
    <Container className="py-4">
      <Card className="mb-4">
        <Card.Header as="h4" className="text-center bg-primary text-white">
          Invoice List
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Control 
                  type="text" 
                  placeholder="Search invoices..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Table striped bordered hover responsive>
            <thead className="bg-light">
              <tr>
                <th>#</th>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Actions</th>
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
                    <td>
                      <Button 
                        variant="info" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        View
                      </Button>
                      <Button 
                        variant="success" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handlePrintInvoice(invoice)}
                      >
                        Print
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDeleteInvoice(invoice.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">No invoices found</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default InvoiceList;