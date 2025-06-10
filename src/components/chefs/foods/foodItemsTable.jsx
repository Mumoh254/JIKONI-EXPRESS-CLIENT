import React, { useState } from "react";
import UseProducts from "./useProducts"; // Ensure this path is correct
import Swal from "sweetalert2";
import { FaEye, FaEdit, FaTrash, FaSync, FaPlus } from "react-icons/fa";
import { Table, Container, Button, Spinner, Alert, Form, Badge, InputGroup, Row, Col } from "react-bootstrap";
import FoodPostForm from "./foodPostForm"; // Import the specific FoodPostForm (for CREATE)
import EditFoodModal from "./EditFoodModal"; // Import the specific EditFoodModal (for EDIT)
import styled from "styled-components";

// Jikoni Express Color Palette
const colors = {
  primary: '#FF4532', // Jikoni Red (for table)
  secondary: '#00C853', // Jikoni Green (for table)
  darkText: '#1A202C', // Dark text for headings
  lightBackground: '#F0F2F5', // Light background for the page
  cardBackground: '#FFFFFF', // White for the form card
  borderColor: '#D1D9E6', // Light border for inputs
  errorText: '#EF4444', // Red for errors
  placeholderText: '#A0AEC0', // Muted text for placeholders
  buttonHover: '#E6392B', // Darker red on button hover
  disabledButton: '#CBD5E1', // Gray for disabled buttons
  gradientStart: '#FF6F59', // Lighter red for gradient (not used in this snippet)
  successGreen: '#28A745', // For positive feedback
};

// --- Styled Components for Table and Buttons ---
const StyledButton = styled(Button)`
  &.btn-primary {
    background-color: ${colors.primary};
    border-color: ${colors.primary};
    &:hover {
      background-color: ${colors.buttonHover};
      border-color: ${colors.buttonHover};
    }
  }
  &.btn-success {
    background-color: ${colors.secondary};
    border-color: ${colors.secondary};
    &:hover {
      background-color: ${colors.successGreen}; /* A slightly darker green on hover */
      border-color: ${colors.successGreen};
    }
  }
  &.btn-outline-primary {
    color: ${colors.primary};
    border-color: ${colors.primary};
    &:hover {
      background-color: ${colors.primary};
      color: white;
    }
  }
  &.btn-outline-success {
    color: ${colors.secondary};
    border-color: ${colors.secondary};
    &:hover {
      background-color: ${colors.secondary};
      color: white;
    }
  }
  &.btn-outline-danger {
    color: ${colors.errorText};
    border-color: ${colors.errorText};
    &:hover {
      background-color: ${colors.errorText};
      color: white;
    }
  }
`;

const FoodItemsTable = () => {
  const { products, loading, error, fetchProducts } = UseProducts();
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for the CREATE FoodPostForm modal
  const [showFoodPostModal, setShowFoodPostModal] = useState(false);

  // State for the EDIT EditFoodModal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null); // Holds the food item to be edited

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
        <div class="text-left" style="font-size: 1rem; color: ${colors.darkText};">
          <p style="margin-bottom: 0.5rem;"><b>Slug:</b> ${product.slug}</p>
          <p style="margin-bottom: 0.5rem;"><b>Category:</b> ${product.category}</p>
          <p style="margin-bottom: 0.5rem;"><b>Price:</b> KSH ${product.price}</p>
          <p style="margin-bottom: 0.5rem;"><b>Stock:</b> ${product.quantity}</p>
          <p style="margin-bottom: 0.5rem;"><b>Brand:</b> ${product.brand}</p>
          <p style="margin-bottom: 0.5rem;"><b>Sizes:</b> ${Array.isArray(product.sizes) ? product.sizes.join(", ") : "N/A"}</p>
          <p style="margin-bottom: 0.5rem;"><b>Description:</b> ${product.description}</p>
          ${product.imageUrl ? `<p style="margin-bottom: 0.5rem;"><b>Image:</b> <br/><img src="${product.imageUrl}" alt="${product.title}" style="max-width: 100%; height: auto; border-radius: 8px; margin-top: 10px;"/></p>` : ''}
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      background: colors.cardBackground,
      color: colors.darkText,
      width: "600px",
      customClass: {
        popup: 'custom-swal-popup',
        title: 'custom-swal-title',
        htmlContainer: 'custom-swal-html-container'
      },
      buttonsStyling: false,
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
      background: colors.cardBackground,
      color: colors.darkText,
      customClass: {
        popup: 'custom-swal-popup'
      }
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
            background: colors.cardBackground,
            confirmButtonColor: colors.primary,
            customClass: {
              popup: 'custom-swal-popup'
            }
          });
          fetchProducts();
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: error.message,
            icon: 'error',
            background: colors.cardBackground,
            confirmButtonColor: colors.primary,
            customClass: {
              popup: 'custom-swal-popup'
            }
          });
        }
      }
    });
  };

  // --- Handlers for FoodPostForm (CREATE) ---
  const handleOpenFoodPostModal = () => {
    setShowFoodPostModal(true);
  };

  const handleCloseFoodPostModal = () => {
    setShowFoodPostModal(false);
    fetchProducts(); // Refresh products after creation
  };

  // --- Handlers for EditFoodModal (EDIT) ---
  const handleOpenEditModal = (foodItem) => {
    setEditingFood(foodItem); // Set the food item to be edited
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingFood(null); // Clear the editing food when closing
    fetchProducts(); // Refresh products after update
  };

  const handleFoodUpdated = (updatedFood) => {
    // This function will be called by EditFoodModal when an update is successful
    // You can update local state if needed, or just let fetchProducts handle it.
    console.log('Food updated:', updatedFood);
    fetchProducts(); // Ensure the table is refreshed
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
          <StyledButton
            variant="primary"
            onClick={fetchProducts}
            style={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 600
            }}
          >
            <FaSync className="me-2" /> Refresh
          </StyledButton>

          {/* This button opens the CREATE FoodPostForm modal */}
          <StyledButton
            variant="success"
            onClick={handleOpenFoodPostModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 600
            }}
          >
            <FaPlus className="me-2" /> Add Product
          </StyledButton>
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
                  <StyledButton
                    variant="outline-primary"
                    className="mt-3"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear search
                  </StyledButton>
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
                      <StyledButton
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleView(product)}
                        style={{
                          width: '35px',
                          height: '35px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0
                        }}
                      >
                        <FaEye />
                      </StyledButton>
                      
                      {/* This button opens the EDIT EditFoodModal */}
                      <StyledButton
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleOpenEditModal(product)} // Pass the specific product to edit
                        style={{
                          width: '35px',
                          height: '35px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0
                        }}
                      >
                        <FaEdit />
                      </StyledButton>
                      <StyledButton
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(product._id)}
                        style={{
                          width: '35px',
                          height: '35px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0
                        }}
                      >
                        <FaTrash />
                      </StyledButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* RENDER THE FOODPOSTFORM COMPONENT FOR CREATION */}
      <FoodPostForm
        show={showFoodPostModal} // Controls visibility for the CREATE modal
        onHide={handleCloseFoodPostModal} // Function to close the CREATE modal
        setFoods={fetchProducts} // Passed to update the list after creation
      />

      {/* RENDER THE EDITFOODMODAL COMPONENT FOR EDITING */}
      {editingFood && ( // Only render EditFoodModal if there's a food to edit
        <EditFoodModal
          show={showEditModal} // Controls visibility for the EDIT modal
          food={editingFood} // Pass the specific food object to be edited
          onHide={handleCloseEditModal} // Function to close the EDIT modal
          onUpdate={handleFoodUpdated} // Callback for when food is successfully updated
        />
      )}
    </Container>
  );
};

export default FoodItemsTable;