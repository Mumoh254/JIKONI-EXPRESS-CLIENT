import React, { useState, useEffect } from "react";
import { Table, Container, Button, Spinner, Alert, Form, Badge, InputGroup, Dropdown, Pagination } from "react-bootstrap";

// --- Jikoni Express Color Palette (for direct use in inline styles or custom CSS) ---
const colors = {
  primary: '#FF4532',
  secondary: '#00C853',
  darkText: '#1A202C',
  lightText: '#6C757D',
  pageBackground: '#F7F8FC',
  cardBackground: '#FFFFFF',
  borderColor: '#E0E6ED',
  errorText: '#EF4444',
  placeholderText: '#A0AEC0',
  buttonHover: '#E6392B',
  discountText: '#3B82F6', // A nice blue for discounts
};

// UseProducts hook to fetch data from the backend
const UseProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductsFromBackend = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/apiV1/smartcity-ke/get/foods');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Assuming the data returned has a 'foods' array
      setProducts(data || []);
    } catch (e) {
      console.error("Failed to fetch products:", e);
      setError(`Failed to load products: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsFromBackend();
  }, []); // Empty dependency array means this runs once on mount

  return { products, loading, error, fetchProducts: fetchProductsFromBackend };
};

// Custom Modal Component (retained from previous version)
const CustomModal = ({ isOpen, onClose, title, children, confirmButtonText, onConfirm, showCancelButton = true, cancelButtonText = 'Cancel', onCancel }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1050, // Bootstrap modal z-index
      fontFamily: '"Inter", sans-serif'
    }}>
      <div style={{
        backgroundColor: colors.cardBackground,
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        width: '100%',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 'bold', color: colors.darkText, margin: 0 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem',
              color: colors.lightText, padding: '0.25rem', borderRadius: '50%',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.borderColor}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            &times;
          </button>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          {children}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          {showCancelButton && (
            <Button
              variant="secondary"
              onClick={onCancel || onClose}
              style={{
                backgroundColor: colors.lightText,
                borderColor: colors.lightText,
                fontWeight: 600,
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
              }}
            >
              {cancelButtonText}
            </Button>
          )}
          {confirmButtonText && onConfirm && (
            <Button
              variant={confirmButtonText.includes('Delete') ? 'danger' : 'primary'}
              onClick={onConfirm}
              style={{
                backgroundColor: confirmButtonText.includes('Delete') ? colors.errorText : colors.primary,
                borderColor: confirmButtonText.includes('Delete') ? colors.errorText : colors.primary,
                fontWeight: 600,
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
              }}
            >
              {confirmButtonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};


const AdminProductsTable = () => {
  const { products, loading, error, fetchProducts } = UseProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(5); // Number of products per page

  // State for Custom Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    body: null, // JSX
    confirmText: '',
    onConfirm: null,
    showCancel: true,
  });

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current products for the page
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const discountOptions = [0, 10, 20, 30, 40, 50, 60];

  const openModal = (title, body, confirmText = '', onConfirm = null, showCancel = true) => {
    setModalContent({ title, body, confirmText, onConfirm, showCancel });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent({ title: '', body: null, confirmText: '', onConfirm: null, showCancel: true });
  };

  const handleView = (product) => {
    const discount = product.discount || 0;
    const finalPrice = product.price * (1 - discount / 100);

    const priceHtml = (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
        {discount > 0 && (
          <p style={{ color: colors.lightText, fontSize: '1rem', textDecoration: 'line-through', margin: 0 }}>KSH {product.price.toLocaleString()}</p>
        )}
        <p style={{ color: colors.primary, fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>KSH {finalPrice.toLocaleString()}</p>
      </div>
    );

    const modalBody = (
      <div style={{ textAlign: 'left', padding: '1rem' }}>
        {priceHtml}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem', borderTop: `1px solid ${colors.borderColor}`, paddingTop: '1rem' }}>
          <p style={{ margin: 0, color: colors.darkText, fontWeight: '600' }}>Category: <span style={{ color: colors.lightText, fontWeight: 'normal' }}>{product.category}</span></p>
          <p style={{ margin: 0, color: colors.darkText, fontWeight: '600' }}>Discount: <span style={{ backgroundColor: `${colors.discountText}1A`, color: colors.discountText, padding: '0.3em 0.6em', borderRadius: '9999px', fontWeight: '600', fontSize: '0.85rem' }}>{discount}% OFF</span></p>
          <p style={{ margin: 0, color: colors.darkText, fontWeight: '600' }}>Sizes: <span style={{ color: colors.lightText, fontWeight: 'normal' }}>{Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes.join(", ") : "N/A"}</span></p>
        </div>
        <hr style={{ borderColor: colors.borderColor, marginTop: '1.5rem', marginBottom: '1.5rem'}}/>
        <p style={{ color: colors.darkText, lineHeight: '1.6', textAlign: 'justify' }}>{product.description}</p>
      </div>
    );

    openModal(product.title, modalBody, '', null, false); // No confirm/cancel buttons for view
  };

  const handleDelete = (productId, productName) => {
    const modalBody = (
      <p style={{ color: colors.darkText }}>Are you sure you want to delete <strong style={{ color: colors.darkText }}>{productName}</strong>? This action cannot be undone.</p>
    );

    const confirmDelete = async () => {
      // Show loading state in modal
      openModal("Deleting...", <div className="text-center py-4"><Spinner animation="border" style={{ color: colors.primary }} /></div>, null, null, false);

      try {
        // Replace with your actual delete API call
        // const response = await fetch(`http://localhost:8000/api/v1/shopingsite/delete/${productId}`, {
        //     method: 'DELETE',
        //     headers: {
        //         'Authorization': `Bearer ${localStorage.getItem("adminToken")}`
        //     },
        // });
        // if (!response.ok) {
        //     const errorData = await response.json();
        //     throw new Error(errorData.message || 'Deletion failed.');
        // }

        // Simulate success
        await new Promise(resolve => setTimeout(resolve, 1000));
        fetchProducts(); // Refresh the list
        closeModal();
        openModal('Deleted!', <p style={{ color: colors.darkText }}>Product {productName} has been deleted.</p>, '', null, false);
        setTimeout(closeModal, 1500); // Auto-close success modal
      } catch (error) {
        closeModal();
        openModal('Error!', <p style={{ color: colors.errorText }}>{error.message}</p>, '', null, false);
        setTimeout(closeModal, 2000); // Auto-close error modal
      }
    };

    openModal('Delete Product?', modalBody, 'Yes, Delete It', confirmDelete, true);
  };

  const handleCreateOrUpdate = (product = null) => {
    const isUpdating = !!product;
    const title = isUpdating ? `Edit ${product.title}` : 'Create New Product';

    // State for form fields within the modal
    const [formState, setFormState] = useState({
        title: product ? product.title : '',
        price: product ? product.price : '',
        discount: product ? product.discount : 0,
        sizes: product && Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
        description: product ? product.description : '',
    });

    // Handle form input changes
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormState(prev => ({ ...prev, [id]: value }));
    };

    const modalBody = (
      <Form className="d-flex flex-column gap-3" style={{ textAlign: 'left' }}>
        <Form.Group controlId="title">
          <Form.Label style={{ fontWeight: '600', color: colors.darkText, marginBottom: '0.25rem' }}>Product Name:</Form.Label>
          <Form.Control type="text" placeholder="e.g., Spicy Chicken Wings" value={formState.title} onChange={handleChange} style={{ borderRadius: '8px', borderColor: colors.borderColor, padding: '0.75rem 1rem' }}/>
        </Form.Group>
        <Form.Group controlId="price">
          <Form.Label style={{ fontWeight: '600', color: colors.darkText, marginBottom: '0.25rem' }}>Price (KSH):</Form.Label>
          <Form.Control type="number" placeholder="e.g., 1500" value={formState.price} onChange={handleChange} style={{ borderRadius: '8px', borderColor: colors.borderColor, padding: '0.75rem 1rem' }}/>
        </Form.Group>
        <Form.Group controlId="discount">
          <Form.Label style={{ fontWeight: '600', color: colors.darkText, marginBottom: '0.25rem' }}>Discount:</Form.Label>
          <Form.Select value={formState.discount} onChange={handleChange} style={{ borderRadius: '8px', borderColor: colors.borderColor, padding: '0.75rem 1rem' }}>
            {discountOptions.map(opt => (
              <option key={opt} value={opt}>
                {opt}% {opt === 0 ? '(No Discount)' : ''}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group controlId="sizes">
          <Form.Label style={{ fontWeight: '600', color: colors.darkText, marginBottom: '0.25rem' }}>Sizes (comma-separated):</Form.Label>
          <Form.Control type="text" placeholder="e.g., Small, Medium, Large" value={formState.sizes} onChange={handleChange} style={{ borderRadius: '8px', borderColor: colors.borderColor, padding: '0.75rem 1rem' }}/>
        </Form.Group>
        <Form.Group controlId="description">
          <Form.Label style={{ fontWeight: '600', color: colors.darkText, marginBottom: '0.25rem' }}>Description:</Form.Label>
          <Form.Control as="textarea" rows={4} placeholder="A brief description of the product..." value={formState.description} onChange={handleChange} style={{ borderRadius: '8px', borderColor: colors.borderColor, padding: '0.75rem 1rem' }}/>
        </Form.Group>
      </Form>
    );

    const handleSubmit = async () => {
      let validationError = '';
      if (!formState.title) {
        validationError = 'Product Name is required.';
      } else if (isNaN(parseFloat(formState.price)) || parseFloat(formState.price) <= 0) {
        validationError = 'A valid Price is required.';
      }

      if (validationError) {
        openModal('Input Error', <p style={{ color: colors.errorText }}>{validationError}</p>, '', null, false);
        setTimeout(closeModal, 1500);
        return;
      }

      // Show loading state in modal
      openModal("Saving...", <div className="text-center py-4"><Spinner animation="border" style={{ color: colors.primary }} /></div>, null, null, false);

      const payload = {
        title: formState.title,
        price: parseFloat(formState.price),
        discount: parseInt(formState.discount, 10),
        sizes: formState.sizes.split(',').map(s => s.trim()).filter(Boolean),
        description: formState.description,
        category: product ? product.category : 'General', // Default or existing category
        // slug: slugify(formState.title, { lower: true, strict: true }), // slugify import missing, removed for compilation
      };

      try {
        // Mock API call for create/update
        // const url = isUpdating
        //     ? `http://localhost:8000/api/v1/shopingsite/update/${product._id}`
        //     : `http://localhost:8000/api/v1/shopingsite/create`;
        // const method = isUpdating ? 'PUT' : 'POST';
        // const response = await fetch(url, {
        //     method,
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${localStorage.getItem("adminToken")}`
        //     },
        //     body: JSON.stringify(payload)
        // });
        // if (!response.ok) {
        //     const errorData = await response.json();
        //     throw new Error(errorData.message || 'Request failed.');
        // }

        // Simulate success
        await new Promise(resolve => setTimeout(resolve, 1000));
        fetchProducts(); // Refresh the product list
        closeModal();
        openModal(isUpdating ? 'Updated!' : 'Created!', <p style={{ color: colors.darkText }}>Product has been {isUpdating ? 'updated' : 'created'}.</p>, '', null, false);
        setTimeout(closeModal, 1500); // Auto-close success modal
      } catch (error) {
        closeModal();
        openModal('Error!', <p style={{ color: colors.errorText }}>{error.message}</p>, '', null, false);
        setTimeout(closeModal, 2000); // Auto-close error modal
      }
    };

    openModal(title, modalBody, isUpdating ? 'Save Changes' : 'Create Product', handleSubmit, true);
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
      <Spinner animation="border" style={{ color: colors.primary }} />
    </div>
  );

  if (error) return (
    <Container className="mt-4">
      <Alert variant="danger">{error}</Alert>
    </Container>
  );

  return (
    <Container style={{ backgroundColor: colors.pageBackground, minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem', fontFamily: '"Inter", sans-serif' }}>
      {/* Controls Card */}
      <div style={{ backgroundColor: colors.cardBackground, padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Header Title */}
          <div>
            <h2 style={{ fontWeight: '700', color: colors.darkText, margin: 0 }}>Product Management</h2>
            <p className="mb-0 text-muted">Showing {filteredProducts.length} of {products.length} products.</p>
          </div>
          {/* Add Product Button (Removed as per request) */}
        </div>
        {/* Search Input */}
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Search by product name or category..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on new search
            }}
            style={{ borderRight: 'none', borderColor: colors.borderColor, boxShadow: 'none', padding: '0.75rem 1rem', height: '48px', borderRadius: '8px 0 0 8px' }}
          />
          <InputGroup.Text style={{ backgroundColor: 'transparent', borderLeft: 'none', borderColor: colors.borderColor, color: colors.placeholderText, borderRadius: '0 8px 8px 0' }}>
            {/* Search Icon (Lucide-react converted to inline SVG) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </InputGroup.Text>
        </InputGroup>
      </div>

      {/* Products Table */}
      <div style={{ backgroundColor: colors.cardBackground, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
        <Table hover responsive style={{ borderCollapse: 'separate', borderSpacing: 0, verticalAlign: 'middle' }}>
          <thead style={{ backgroundColor: colors.pageBackground }}>
            <tr>
              <th style={{ color: colors.lightText, fontWeight: '600', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px', borderBottom: `1px solid ${colors.borderColor}`, padding: '1rem 1.25rem' }}>Product</th>
              <th style={{ color: colors.lightText, fontWeight: '600', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px', borderBottom: `1px solid ${colors.borderColor}`, padding: '1rem 1.25rem' }}>Price</th>
              <th style={{ color: colors.lightText, fontWeight: '600', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px', borderBottom: `1px solid ${colors.borderColor}`, padding: '1rem 1.25rem' }}>Discount</th>
              <th style={{ color: colors.lightText, fontWeight: '600', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px', borderBottom: `1px solid ${colors.borderColor}`, padding: '1rem 1.25rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <tr key={product._id} style={{ transition: 'background-color 0.15s ease-in-out' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fcf5f4'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '1.25rem', borderTop: `1px solid ${colors.borderColor}` }}>
                    <div className="product-title" style={{ fontWeight: '600', color: colors.darkText }}>{product.title}</div>
                    <div className="product-category" style={{ fontSize: '0.9rem', color: colors.lightText }}>{product.category}</div>
                  </td>
                  <td style={{ padding: '1.25rem', borderTop: `1px solid ${colors.borderColor}` }}>KSH {product.price.toLocaleString()}</td>
                  <td style={{ padding: '1.25rem', borderTop: `1px solid ${colors.borderColor}` }}>
                    {product.discount > 0 ? (
                       <Badge pill style={{ backgroundColor: `${colors.discountText}1A`, color: colors.discountText, fontWeight: '600', fontSize: '0.9rem', borderRadius: '9999px', padding: '0.4em 0.7em' }}>
                          {product.discount}%
                       </Badge>
                    ) : (
                       <span className="text-muted">N/A</span>
                    )}
                  </td>
                  <td style={{ padding: '1.25rem', borderTop: `1px solid ${colors.borderColor}` }}>
                      <Dropdown align="end">
                         <Dropdown.Toggle as="div" style={{ cursor: 'pointer', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'background-color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.borderColor} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                           {/* Three Dots Vertical Icon (Lucide-react converted to inline SVG) */}
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical" style={{ color: colors.lightText }}><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                         </Dropdown.Toggle>
                         <Dropdown.Menu>
                           <Dropdown.Item onClick={() => handleView(product)}>
                             {/* Eye Icon (Lucide-react converted to inline SVG) */}
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye me-2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg> View Details
                           </Dropdown.Item>
                           <Dropdown.Item onClick={() => handleCreateOrUpdate(product)}>
                             {/* Edit Icon (Lucide-react converted to inline SVG) */}
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit me-2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg> Edit Product
                           </Dropdown.Item>
                           <Dropdown.Item onClick={() => handleCreateOrUpdate(product)}>
                               {/* Tag Icon (Lucide-react converted to inline SVG) */}
                               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tag me-2"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414L19 21.414a2 2 0 0 0 2.828 0 2 2 0 0 0 0-2.828Z"/><path d="M7 7h.01"/></svg> Manage Discount
                           </Dropdown.Item>
                           <Dropdown.Divider />
                           <Dropdown.Item className="text-danger" onClick={() => handleDelete(product._id, product.title)}>
                             {/* Trash Icon (Lucide-react converted to inline SVG) */}
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash me-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg> Delete Product
                           </Dropdown.Item>
                         </Dropdown.Menu>
                       </Dropdown>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-5">
                  <div className="text-muted">
                    <h5>No Products Found</h5>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        {/* Pagination Controls */}
        {filteredProducts.length > productsPerPage && (
          <div className="d-flex justify-content-center p-3" style={{ borderTop: `1px solid ${colors.borderColor}` }}>
            <Pagination>
              <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === currentPage}
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
            </Pagination>
          </div>
        )}
      </div>

      {/* Custom Modal Render */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalContent.title}
        confirmButtonText={modalContent.confirmText}
        onConfirm={modalContent.onConfirm}
        showCancelButton={modalContent.showCancel}
      >
        {modalContent.body}
      </CustomModal>
    </Container>
  );
};

export default AdminProductsTable;
