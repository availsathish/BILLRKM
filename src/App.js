import React, { useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Invoice from './components/Invoice';
import CustomerMaster from './components/CustomerMaster';
import ProductMaster from './components/ProductMaster';
import InvoiceList from './components/InvoiceList';
import Payments from './components/Payments';
import Reports from './components/Reports';

function App() {
  const [activeTab, setActiveTab] = useState('invoice');

  return (
    <div className="App">
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home">RKM LOOM SPARES</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link 
                href="#invoice" 
                active={activeTab === 'invoice'}
                onClick={() => setActiveTab('invoice')}
              >
                Invoice
              </Nav.Link>
              <Nav.Link 
                href="#invoiceList" 
                active={activeTab === 'invoiceList'}
                onClick={() => setActiveTab('invoiceList')}
              >
                Invoice List
              </Nav.Link>
              <Nav.Link 
                href="#payments" 
                active={activeTab === 'payments'}
                onClick={() => setActiveTab('payments')}
              >
                Payments
              </Nav.Link>
              <Nav.Link 
                href="#reports" 
                active={activeTab === 'reports'}
                onClick={() => setActiveTab('reports')}
              >
                Reports
              </Nav.Link>
              <Nav.Link 
                href="#customers" 
                active={activeTab === 'customers'}
                onClick={() => setActiveTab('customers')}
              >
                Customer Master
              </Nav.Link>
              <Nav.Link 
                href="#products" 
                active={activeTab === 'products'}
                onClick={() => setActiveTab('products')}
              >
                Product Master
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        {activeTab === 'invoice' && <Invoice />}
        {activeTab === 'invoiceList' && <InvoiceList />}
        {activeTab === 'payments' && <Payments />}
        {activeTab === 'reports' && <Reports />}
        {activeTab === 'customers' && <CustomerMaster />}
        {activeTab === 'products' && <ProductMaster />}
      </Container>
    </div>
  );
}

export default App;