import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Card } from 'react-bootstrap';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

function Invoice() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    address: '',
    phone: ''
  });
  
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().substr(0, 10));
  
  const [items, setItems] = useState([
    { id: 1, productId: '', name: '', quantity: 1, price: 0, total: 0 }
  ]);
  
  const [subTotal, setSubTotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  
  // Load customers and products from localStorage
  useEffect(() => {
    const storedCustomers = localStorage.getItem('customers');
    if (storedCustomers) {
      setCustomers(JSON.parse(storedCustomers));
    }
    
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
  }, []);
  
  // Calculate totals whenever items change
  useEffect(() => {
    // Calculate subtotal directly from current items
    const newSubTotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    setSubTotal(newSubTotal);
    
    // No GST calculation anymore
    setTaxAmount(0);
    
    // Grand total is same as subtotal now
    setGrandTotal(newSubTotal);
  }, [items]);
  
  const calculateTotals = () => {
    // This function is now only used for manual recalculation if needed
    // The automatic calculation happens in the useEffect above
  };
  
  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setSelectedCustomer(customerId);
    
    if (customerId) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setCustomerDetails({
          name: customer.name,
          address: customer.address,
          phone: customer.phone
        });
      }
    } else {
      setCustomerDetails({
        name: '',
        address: '',
        phone: ''
      });
    }
  };
  
  const handleProductChange = (id, productId) => {
    if (productId) {
      const product = products.find(p => p.id === productId);
      if (product) {
        const updatedItems = items.map(item => {
          if (item.id === id) {
            return {
              ...item,
              productId,
              name: product.name,
              price: parseFloat(product.price),
              total: item.quantity * parseFloat(product.price)
            };
          }
          return item;
        });
        
        setItems(updatedItems);
      }
    }
  };
  
  const handleItemChange = (id, field, value) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total if quantity or price changes
        if (field === 'quantity' || field === 'price') {
          updatedItem.total = updatedItem.quantity * updatedItem.price;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setItems(updatedItems);
  };
  
  const addItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    setItems([...items, { id: newId, productId: '', name: '', quantity: 1, price: 0, total: 0 }]);
  };
  
  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };
  
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add company info
    doc.setFontSize(20);
    doc.text("RKM LOOM SPARES", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text("123 Business Street, City, State, PIN", 105, 30, { align: "center" });
    doc.text("Phone: +91 1234567890 | Email: info@rkmloomspares.com", 105, 35, { align: "center" });
    
    // Add invoice title
    doc.setFontSize(16);
    doc.text("INVOICE", 105, 50, { align: "center" });
    
    // Add invoice details
    doc.setFontSize(10);
    doc.text(`Invoice No: ${invoiceNumber}`, 15, 60);
    doc.text(`Date: ${invoiceDate}`, 15, 65);
    
    // Add customer details
    doc.text("Bill To:", 15, 75);
    doc.text(`Name: ${customerDetails.name}`, 15, 80);
    doc.text(`Address: ${customerDetails.address}`, 15, 85);
    doc.text(`Phone: ${customerDetails.phone}`, 15, 90);
    
    // Add items table
    const tableColumn = ["No", "Item", "Qty", "Price", "Total"];
    const tableRows = items.map((item, index) => [
      index + 1,
      item.name,
      item.quantity,
      item.price.toFixed(2),
      item.total.toFixed(2)
    ]);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 105,
      theme: 'grid'
    });
    
    // Add totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Total Amount: ₹${grandTotal.toFixed(2)}`, 150, finalY);
    
    // Add footer
    doc.setFontSize(8);
    doc.text("Thank you for your business!", 105, 280, { align: "center" });
    
    // Save the PDF
    doc.save(`Invoice-${invoiceNumber}.pdf`);
  };
  
  return (
    <Container className="py-4">
      <Card className="mb-4">
        <Card.Header as="h4" className="text-center bg-primary text-white">
          Create Invoice
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Select Customer</Form.Label>
                <Form.Select 
                  value={selectedCustomer} 
                  onChange={handleCustomerChange}
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Customer Address</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={2} 
                  value={customerDetails.address} 
                  readOnly 
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Customer Phone</Form.Label>
                <Form.Control 
                  type="text" 
                  value={customerDetails.phone} 
                  readOnly 
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Invoice Number</Form.Label>
                <Form.Control 
                  type="text" 
                  value={invoiceNumber} 
                  onChange={(e) => setInvoiceNumber(e.target.value)} 
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Invoice Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={invoiceDate} 
                  onChange={(e) => setInvoiceDate(e.target.value)} 
                />
              </Form.Group>

            </Col>
          </Row>
          
          <h5 className="mb-3">Invoice Items</h5>
          <Table striped bordered hover responsive>
            <thead className="bg-light">
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price (₹)</th>
                <th>Total (₹)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <Form.Select
                      value={item.productId}
                      onChange={(e) => handleProductChange(item.id, e.target.value)}
                    >
                      <option value="">-- Select Product --</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </Form.Select>
                  </td>
                  <td>
                    <Form.Control 
                      type="number" 
                      min="1" 
                      value={item.quantity} 
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)} 
                    />
                  </td>
                  <td>
                    <Form.Control 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      value={item.price} 
                      onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)} 
                    />
                  </td>
                  <td>₹{item.total.toFixed(2)}</td>
                  <td>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          <Button variant="success" className="mb-4" onClick={addItem}>
            Add Item
          </Button>
          
          <Row className="mt-4">
            <Col md={6}></Col>
            <Col md={6}>
              <Table bordered>
                <tbody>
                  <tr className="table-active">
                    <td><strong>Total Amount:</strong></td>
                    <td className="text-end"><strong>₹{grandTotal.toFixed(2)}</strong></td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-end mt-3">
            <Button variant="primary" size="lg" onClick={generatePDF}>
              Generate Invoice PDF
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Invoice;