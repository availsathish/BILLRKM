import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Card, Modal } from 'react-bootstrap';

function ProductMaster() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    id: '',
    productCode: '',
    name: '',
    description: '',
    price: '',
    hsnCode: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load products from localStorage on component mount
  useEffect(() => {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
  }, []);

  // Save products to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({ ...currentProduct, [name]: value });
  };

  const handleAddProduct = () => {
    setCurrentProduct({
      id: Date.now().toString(),
      productCode: '',
      name: '',
      description: '',
      price: '',
      hsnCode: ''
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(product => product.id !== id));
    }
  };

  const handleSubmit = () => {
    if (!currentProduct.name.trim()) {
      alert('Product name is required!');
      return;
    }

    if (!currentProduct.price || isNaN(currentProduct.price)) {
      alert('Please enter a valid price!');
      return;
    }

    if (isEditing) {
      // Update existing product
      setProducts(products.map(product => 
        product.id === currentProduct.id ? currentProduct : product
      ));
    } else {
      // Add new product
      setProducts([...products, currentProduct]);
    }

    setShowModal(false);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.hsnCode.includes(searchTerm)
  );

  return (
    <Container className="py-4">
      <Card className="mb-4">
        <Card.Header as="h4" className="text-center bg-primary text-white">
          Product Master
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Button variant="success" onClick={handleAddProduct}>
                Add New Product
              </Button>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Control 
                  type="text" 
                  placeholder="Search products..." 
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
                <th>Product Code</th>
                <th>Name</th>
                <th>Description</th>
                <th>Price (₹)</th>
                <th>HSN Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <tr key={product.id}>
                    <td>{index + 1}</td>
                    <td>{product.productCode}</td>
                    <td>{product.name}</td>
                    <td>{product.description}</td>
                    <td>₹{parseFloat(product.price).toFixed(2)}</td>
                    <td>{product.hsnCode}</td>
                    <td>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleEditProduct(product)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">No products found</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add/Edit Product Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Product Code*</Form.Label>
              <Form.Control 
                type="text" 
                name="productCode"
                value={currentProduct.productCode} 
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Product Name*</Form.Label>
              <Form.Control 
                type="text" 
                name="name"
                value={currentProduct.name} 
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2} 
                name="description"
                value={currentProduct.description} 
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price (₹)*</Form.Label>
              <Form.Control 
                type="number" 
                min="0" 
                step="0.01"
                name="price"
                value={currentProduct.price} 
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>HSN Code</Form.Label>
              <Form.Control 
                type="text" 
                name="hsnCode"
                value={currentProduct.hsnCode} 
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ProductMaster;