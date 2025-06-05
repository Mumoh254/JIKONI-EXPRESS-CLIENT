import React from "react";
import UseProducts from "../useproduct";
import Swal from "sweetalert2";
import { FaEye, FaEdit, FaTrash, FaSync, FaPlus } from "react-icons/fa";
import { Table, Container, Button, Spinner, Alert, Form, Badge, InputGroup, Row, Col } from "react-bootstrap";
import slugify from "slugify";

// Jikoni Express Color Palette
const colors = {
  primary: '#FF4532', // Jikoni Red
  secondary: '#00C853', // Jikoni Green
  darkText: '#1A202C', // Dark text for headings
  lightBackground: '#F0F2F5', // Light background for the page
  cardBackground: '#FFFFFF', // White for the form card
  borderColor: '#D1D9E6', // Light border for inputs
  errorText: '#EF4444', // Red for errors
  placeholderText: '#A0AEC0', // Muted text for placeholders
  buttonHover: '#E6392B', // Darker red on button hover
  disabledButton: '#CBD5E1', // Gray for disabled buttons
};

const AdminProductsTable = () => {
  const { products, loading, error, fetchProducts } = UseProducts();
  const [searchTerm, setSearchTerm] = React.useState("");
  
  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (product) => {
    Swal.fire({
      title: `<strong style="color: ${colors.primary}">${product.title}</strong>`,
      html: `
        <div class="text-left" style="font-size: 1rem;">
          <p><b>Slug:</b> ${product.slug}</p>
          <p><b>Category:</b> ${product.category}</p>
          <p><b>Price:</b> KSH ${product.price}</p>
          <p><b>Stock:</b> ${product.quantity}</p>
          <p><b>Brand:</b> ${product.brand}</p>
          <p><b>Sizes:</b> ${Array.isArray(product.sizes) ? product.sizes.join(", ") : "N/A"}</p>
          <p><b>Description:</b> ${product.description}</p>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      background: colors.lightBackground,
      width: "600px",
      customClass: {
        popup: 'custom-swal-popup'
      }
    });
  };

  const handleDelete = async (productId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: colors.errorText,
      cancelButtonColor: colors.placeholderText,
      confirmButtonText: 'Yes, delete it!',
      background: colors.lightBackground
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:8000/api/v1/shopingsite/delete/${productId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem("adminToken")}`
            }
          });

          if (!response.ok) throw new Error('Failed to delete product');
          
          Swal.fire({
            title: 'Deleted!',
            text: 'Product has been deleted.',
            icon: 'success',
            background: colors.lightBackground,
            confirmButtonColor: colors.primary
          });
          fetchProducts();
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: error.message,
            icon: 'error',
            background: colors.lightBackground,
            confirmButtonColor: colors.primary
          });
        }
      }
    });
  };

  const handleUpdate = (product) => {
    Swal.fire({
      title: `<span style="color: ${colors.primary}">Edit ${product.title}</span>`,
      html: `
        <div style="text-align: left; margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500; color: ${colors.darkText}">Product Name</label>
          <input id="name" class="swal2-input" placeholder="Product Name" value="${product.title}" style="border-color: ${colors.borderColor};">
        </div>
        <div style="text-align: left; margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500; color: ${colors.darkText}">Price</label>
          <input id="price" type="number" class="swal2-input" placeholder="Price" value="${product.price}" style="border-color: ${colors.borderColor};">
        </div>
        <div style="text-align: left; margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500; color: ${colors.darkText}">Stock Quantity</label>
          <input id="quantity" type="number" class="swal2-input" placeholder="Stock Quantity" value="${product.quantity}" style="border-color: ${colors.borderColor};">
        </div>
        <div style="text-align: left; margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500; color: ${colors.darkText}">Sizes (comma separated)</label>
          <input id="sizes" class="swal2-input" placeholder="Sizes (comma separated)" value="${Array.isArray(product.sizes) ? product.sizes.join(", ") : ""}" style="border-color: ${colors.borderColor};">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      confirmButtonColor: colors.primary,
      background: colors.lightBackground,
      preConfirm: async () => {
        try {
          const updateData = {
            title: Swal.getPopup().querySelector('#name').value,
            price: parseFloat(Swal.getPopup().querySelector('#price').value),
            quantity: parseInt(Swal.getPopup().querySelector('#quantity').value),
            sizes: Swal.getPopup().querySelector('#sizes').value
              .split(',')
              .map(size => size.trim()),
            slug: slugify(Swal.getPopup().querySelector('#name').value, { lower: true })
          };

          const response = await fetch(`http://localhost:8000/api/v1/shopingsite/update/${product._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify(updateData)
          });

          if (!response.ok) throw new Error('Failed to update product');
          
          Swal.fire({
            title: 'Updated!',
            text: 'Product has been updated.',
            icon: 'success',
            background: colors.lightBackground,
            confirmButtonColor: colors.primary
          });
          fetchProducts();
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: error.message,
            icon: 'error',
            background: colors.lightBackground,
            confirmButtonColor: colors.primary
          });
        }
      }
    });
  };

  const handleCreate = () => {
    Swal.fire({
      title: `<span style="color: ${colors.primary}">Create New Product</span>`,
      html: `
        <div style="text-align: left; margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500; color: ${colors.darkText}">Product Name</label>
          <input id="name" class="swal2-input" placeholder="Product Name" style="border-color: ${colors.borderColor};">
        </div>
        <div style="text-align: left; margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500; color: ${colors.darkText}">Price</label>
          <input id="price" type="number" class="swal2-input" placeholder="Price" style="border-color: ${colors.borderColor};">
        </div>
        <div style="text-align: left; margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500; color: ${colors.darkText}">Stock Quantity</label>
          <input id="quantity" type="number" class="swal2-input" placeholder="Stock Quantity" style="border-color: ${colors.borderColor};">
        </div>
        <div style="text-align: left; margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500; color: ${colors.darkText}">Sizes (comma separated)</label>
          <input id="sizes" class="swal2-input" placeholder="Sizes (comma separated)" style="border-color: ${colors.borderColor};">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Create',
      cancelButtonText: 'Cancel',
      confirmButtonColor: colors.primary,
      background: colors.lightBackground,
      preConfirm: async () => {
        try {
          const newProduct = {
            title: Swal.getPopup().querySelector('#name').value,
            price: parseFloat(Swal.getPopup().querySelector('#price').value),
            quantity: parseInt(Swal.getPopup().querySelector('#quantity').value),
            sizes: Swal.getPopup().querySelector('#sizes').value
              .split(',')
              .map(size => size.trim()),
            slug: slugify(Swal.getPopup().querySelector('#name').value, { lower: true }),
            // Default values for other fields
            category: "New Category",
            brand: "New Brand",
            description: "New product description"
          };

          const response = await fetch(`http://localhost:8000/api/v1/shopingsite/create`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify(newProduct)
          });

          if (!response.ok) throw new Error('Failed to create product');
          
          Swal.fire({
            title: 'Created!',
            text: 'Product has been created.',
            icon: 'success',
            background: colors.lightBackground,
            confirmButtonColor: colors.primary
          });
          fetchProducts();
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: error.message,
            icon: 'error',
            background: colors.lightBackground,
            confirmButtonColor: colors.primary
          });
        }
      }
    });
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
      <Spinner animation="border" variant="primary" style={{ color: colors.primary }} />
    </div>
  );

  if (error) return (
    <Container className="mt-4">
      <Alert variant="danger" style={{ backgroundColor: colors.errorText, color: 'white' }}>
        Error: {error}
      </Alert>
    </Container>
  );

  return (
    <Container className="py-4" style={{ backgroundColor: colors.lightBackground, minHeight: '100vh' }}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1" style={{ color: colors.darkText, fontWeight: 700 }}>Product Management</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Manage all products in your inventory
          </p>
        </div>
        
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <Button 
            variant="primary" 
            onClick={fetchProducts}
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.primary,
              display: 'flex',
              alignItems: 'center',
              fontWeight: 600
            }}
          >
            <FaSync className="me-2" /> Refresh
          </Button>
          
          <Button 
            variant="success" 
            onClick={handleCreate}
            style={{
              backgroundColor: colors.secondary,
              borderColor: colors.secondary,
              display: 'flex',
              alignItems: 'center',
              fontWeight: 600
            }}
          >
            <FaPlus className="me-2" /> Add Product
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                borderColor: colors.borderColor,
                boxShadow: 'none',
                height: '45px'
              }}
            />
            <Button 
              variant="outline-secondary"
              onClick={() => setSearchTerm('')}
              style={{ 
                borderColor: colors.borderColor,
                color: colors.placeholderText
              }}
            >
              Clear
            </Button>
          </InputGroup>
        </Col>
        <Col md={6} className="mt-3 mt-md-0 d-flex justify-content-md-end">
          <div className="d-flex align-items-center">
            <span className="me-2" style={{ color: colors.darkText }}>Showing:</span>
            <Badge bg="primary" style={{ backgroundColor: colors.primary }}>
              {filteredProducts.length} products
            </Badge>
          </div>
        </Col>
      </Row>

      <div style={{ 
        backgroundColor: colors.cardBackground, 
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}>
        <Table hover responsive className="mb-0">
          <thead style={{ 
            backgroundColor: colors.primary,
            color: 'white'
          }}>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Brand</th>
              <th>Sizes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-5">
                  <div style={{ fontSize: '1.2rem', color: colors.placeholderText }}>
                    No products found
                  </div>
                  <Button 
                    variant="outline-primary" 
                    className="mt-3"
                    onClick={() => setSearchTerm('')}
                    style={{ 
                      borderColor: colors.primary,
                      color: colors.primary
                    }}
                  >
                    Clear search
                  </Button>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product, index) => (
                <tr key={product._id} style={{ borderBottom: `1px solid ${colors.borderColor}` }}>
                  <td style={{ fontWeight: 600 }}>{index + 1}</td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, color: colors.darkText }}>{product.title}</div>
                      <div style={{ fontSize: '0.85rem', color: colors.placeholderText }}>
                        {product.category}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: colors.primary }}>KSH {product.price}</td>
                  <td>
                    <Badge 
                      bg={product.quantity > 10 ? 'success' : product.quantity > 0 ? 'warning' : 'danger'}
                      style={{
                        backgroundColor: 
                          product.quantity > 10 ? colors.secondary : 
                          product.quantity > 0 ? '#FFC107' : colors.errorText,
                        fontWeight: 500
                      }}
                    >
                      {product.quantity} in stock
                    </Badge>
                  </td>
                  <td>{product.brand}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {Array.isArray(product.sizes) ? 
                        product.sizes.map((size, i) => (
                          <span 
                            key={i} 
                            className="badge rounded-pill"
                            style={{ 
                              backgroundColor: colors.lightBackground,
                              color: colors.darkText,
                              padding: '5px 10px'
                            }}
                          >
                            {size}
                          </span>
                        )) : 
                        <span style={{ color: colors.placeholderText }}>N/A</span>
                      }
                    </div>
                  </td>
                  <td>
                    <Badge 
                      bg={product.status === 'active' ? 'success' : 'secondary'}
                      style={{
                        backgroundColor: product.status === 'active' ? colors.secondary : colors.placeholderText,
                        fontWeight: 500
                      }}
                    >
                      {product.status || 'active'}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={() => handleView(product)}
                        style={{
                          borderColor: colors.primary,
                          color: colors.primary,
                          width: '35px',
                          height: '35px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0
                        }}
                      >
                        <FaEye />
                      </Button>
                      <Button 
                        variant="outline-success" 
                        size="sm" 
                        onClick={() => handleUpdate(product)}
                        style={{
                          borderColor: colors.secondary,
                          color: colors.secondary,
                          width: '35px',
                          height: '35px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0
                        }}
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleDelete(product._id)}
                        style={{
                          borderColor: colors.errorText,
                          color: colors.errorText,
                          width: '35px',
                          height: '35px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0
                        }}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default AdminProductsTable;