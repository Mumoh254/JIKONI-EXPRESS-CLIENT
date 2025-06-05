import React from "react";
import Swal from "sweetalert2";
import { FaEye, FaEdit, FaTrash, FaSync } from "react-icons/fa";
import { Table, Container, Button, Spinner, Alert } from "react-bootstrap";
import slugify from "slugify";
import UseProducts from "./useProducts"; // Make sure this file exports your hook correctly

const FoodItemsTable = () => {
  const { products, loading, error, fetchProducts } = UseProducts();

  const handleView = (product) => {
    Swal.fire({
      title: `<strong>${product.name}</strong>`,
      html: `
        <div class="text-left">
          <img src="${product.image}" alt="${product.name}" style="width: 100px; height: auto; margin-bottom: 10px;" />
          <p><b>Slug:</b> ${product.slug}</p>
          <p><b>Category:</b> ${product.category}</p>
          <p><b>Price:</b> KSH ${product.price}</p>
          <p><b>Stock:</b> ${product.quantity}</p>
          <p><b>Sizes:</b> ${Array.isArray(product.sizes) ? product.sizes.join(", ") : "N/A"}</p>
          <p><b>Description:</b> ${product.description}</p>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      background: "#f8f9fa",
      width: "600px"
    });
  };

  const handleDelete = async (productId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
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

          Swal.fire('Deleted!', 'Product has been deleted.', 'success');
          fetchProducts();
        } catch (error) {
          Swal.fire('Error!', error.message, 'error');
        }
      }
    });
  };

  const handleUpdate = (product) => {
    Swal.fire({
      title: `Edit ${product.name}`,
      html: `
        <input id="name" class="swal2-input" placeholder="Product Name" value="${product.name}">
        <input id="price" type="number" class="swal2-input" placeholder="Price" value="${product.price}">
        <input id="quantity" type="number" class="swal2-input" placeholder="Stock Quantity" value="${product.quantity}">
        <input id="sizes" class="swal2-input" placeholder="Sizes (comma separated)" value="${Array.isArray(product.sizes) ? product.sizes.join(", ") : ""}">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      preConfirm: async () => {
        try {
          const updateData = {
            name: Swal.getPopup().querySelector('#name').value,
            price: parseFloat(Swal.getPopup().querySelector('#price').value),
            quantity: parseInt(Swal.getPopup().querySelector('#quantity').value),
            sizes: Swal.getPopup().querySelector('#sizes').value
              .split(',')
              .map(size => parseInt(size.trim())),
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

          Swal.fire('Updated!', 'Product has been updated.', 'success');
          fetchProducts();
        } catch (error) {
          Swal.fire('Error!', error.message, 'error');
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">Error: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 mb-0">Product Management</h2>
        <Button variant="primary" onClick={fetchProducts}>
          <FaSync className="me-2" /> Refresh Products
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead className="bg-light">
          <tr>
            <th>#</th>
            <th>Image</th>
            <th>Name</th>
            <th>Created</th>
            <th>Price</th>
    
          

          
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-4">No products found</td>
            </tr>
          ) : (
            products.map((product, index) => (
              <tr key={product._id}>
                <td>{index + 1}</td>
                <td>
                  <img
                    src={product.photoUrls
}
                    alt={product.name}
                    style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }}
                  />
                </td>
                <td>{product.title}</td>
                <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                <td>KSH: {product.price}</td>
            
                <td>
                  <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm" onClick={() => handleView(product)}>
                      <FaEye />
                    </Button>
                    <Button variant="outline-success" size="sm" onClick={() => handleUpdate(product)}>
                      <FaEdit />
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(product._id)}>
                      <FaTrash />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default FoodItemsTable;
