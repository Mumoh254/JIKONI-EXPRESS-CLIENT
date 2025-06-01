import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Col, Row, Table, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import popSound from '../../../../public/audio/cliks.mp3';

const BASE_URL = "http://localhost:8000/apiV1/smartcity-ke/get";
const MySwal = withReactContent(Swal);

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

const playSound = () => {
  new Audio(popSound).play();
};

export default function FoodItemsTable() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditFood, setShowEditFood] = useState(null);
  const [showAddFood, setShowAddFood] = useState(false);
  const [error, setError] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/foods`);
      const allFoods = res.data;
      const chefId = localStorage.getItem('chefId');
      const filteredFoods = chefId
        ? allFoods.filter(food => String(food.chef?.id) === String(chefId))
        : allFoods;
      setFoods(filteredFoods);
    } catch (err) {
      console.error('Fetch error:', err.message);
      setError('Failed to fetch food items.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async (id, title) => {
    playSound();
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: `Delete "${title}" permanently?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        container: windowWidth < 576 ? 'swal-mobile' : '',
        popup: windowWidth < 576 ? 'swal-popup-mobile' : '',
        title: windowWidth < 576 ? 'swal-title-mobile' : '',
        actions: windowWidth < 576 ? 'swal-actions-mobile' : ''
      }
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/food/${id}`);
        setFoods(prev => prev.filter(food => food.id !== id));
        Toast.fire({
          icon: 'success',
          title: 'Food item deleted successfully!',
        });
      } catch (err) {
        console.error('Error deleting food:', err.message);
        Toast.fire({
          icon: 'error',
          title: 'Failed to delete food item.',
        });
      }
    }
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const chefId = localStorage.getItem('chefId');
      formData.append('chefId', chefId);
      
      const response = await axios.post(`${BASE_URL}/food`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setFoods(prev => [...prev, response.data]);
      setShowAddFood(false);
      Toast.fire({
        icon: 'success',
        title: 'Food item added successfully!',
      });
    } catch (error) {
      console.error('Error adding food:', error);
      Toast.fire({
        icon: 'error',
        title: 'Failed to add food item.',
      });
    }
  };

  const handleUpdateFood = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await axios.put(`${BASE_URL}/food/${showEditFood.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setFoods(prev => prev.map(food => 
        food.id === showEditFood.id ? response.data : food
      ));
      setShowEditFood(null);
      Toast.fire({
        icon: 'success',
        title: 'Food item updated successfully!',
      });
    } catch (error) {
      console.error('Error updating food:', error);
      Toast.fire({
        icon: 'error',
        title: 'Failed to update food item.',
      });
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const isMobile = windowWidth < 768;

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Fetching food items...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        <h3 className="mb-3 mb-md-0">Food Items Management</h3>
        <Button 
          variant="primary"
          onClick={() => setShowAddFood(true)}
          className="d-flex align-items-center"
          size={isMobile ? "sm" : undefined}
        >
          <i className="bi bi-plus-lg me-2"></i> 
          {isMobile ? "New Food" : "Post New Food"}
        </Button>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {!foods.length ? (
        <div className="text-center py-5 border rounded bg-light">
          <i className="bi bi-emoji-frown fs-1 text-muted"></i>
          <h4 className="mt-3">No food items available</h4>
          <p className="text-muted">Start by posting your first food item</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover className="align-middle">
            <thead className="table-dark">
              <tr>
                <th style={{ width: '100px' }}>Image</th>
                <th>Title</th>
                {!isMobile && <th>Description</th>}
                <th>Price</th>
                {!isMobile && <th>Discount</th>}
                {!isMobile && <th>Type</th>}
                {!isMobile && <th>Created</th>}
                <th style={{ width: isMobile ? '80px' : '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {foods.map(food => (
                <tr key={food.id}>
                  <td className="p-1">
                    <div className="position-relative" style={{ height: '60px', width: '60px' }}>
                      <img
                        src={food.photoUrls[0]}
                        alt={food.title}
                        className="w-100 h-100 object-fit-cover rounded"
                        style={{ border: '1px solid #dee2e6' }}
                      />
                      {food.photoUrls.length > 1 && !isMobile && (
                        <span className="position-absolute top-0 end-0 translate-middle badge bg-dark rounded-pill">
                          +{food.photoUrls.length - 1}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="fw-semibold">
                    {isMobile ? (
                      <div className="d-flex flex-column">
                        <span>{food.title}</span>
                        <small className="text-muted mt-1">
                          {formatDistanceToNow(new Date(food.createdAt), { addSuffix: true })}
                        </small>
                      </div>
                    ) : (
                      food.title
                    )}
                  </td>
                  {!isMobile && (
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '200px' }}>
                        {food.description}
                      </div>
                    </td>
                  )}
                  <td className="fw-bold text-primary">KES {food.price}</td>
                  {!isMobile && (
                    <td>
                      {food.discount > 0 ? (
                        <Badge bg="danger" className="px-2 py-1">
                          {food.discount}% OFF
                        </Badge>
                      ) : (
                        <span className="text-muted">None</span>
                      )}
                    </td>
                  )}
                  {!isMobile && (
                    <td>
                      <Badge bg="info" className="text-capitalize">
                        {food.mealType}
                      </Badge>
                    </td>
                  )}
                  {!isMobile && (
                    <td className="text-muted small">
                      {formatDistanceToNow(new Date(food.createdAt), { addSuffix: true })}
                    </td>
                  )}
                  <td className="d-flex gap-2 justify-content-center">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setShowEditFood(food)}
                      className="d-flex align-items-center justify-content-center"
                      style={{ width: '36px', height: '36px' }}
                      title="Edit"
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => confirmDelete(food.id, food.title)}
                      className="d-flex align-items-center justify-content-center"
                      style={{ width: '36px', height: '36px' }}
                      title="Delete"
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Add Food Modal */}
      <Modal show={showAddFood} onHide={() => setShowAddFood(false)} size="lg">
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>Post New Food Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddFood} encType="multipart/form-data">
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control name="title" required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control name="description" as="textarea" rows={3} required />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (KES)</Form.Label>
                  <Form.Control name="price" type="number" min="1" required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Discount (%)</Form.Label>
                  <Form.Control name="discount" type="number" min="0" max="100" defaultValue="0" />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Meal Type</Form.Label>
              <Form.Select name="mealType" required>
                <option value="">Select meal type</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
                <option value="dessert">Dessert</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Images</Form.Label>
              <Form.Control name="images" type="file" multiple required />
              <Form.Text className="text-muted">Select up to 5 images of your food</Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end mt-4 gap-2">
              <Button variant="secondary" onClick={() => setShowAddFood(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Post Food
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Food Modal */}
      <Modal show={!!showEditFood} onHide={() => setShowEditFood(null)} size="lg">
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>Edit {showEditFood?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showEditFood && (
            <Form onSubmit={handleUpdateFood} encType="multipart/form-data">
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control 
                  name="title" 
                  defaultValue={showEditFood.title} 
                  required 
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control 
                  name="description" 
                  as="textarea" 
                  rows={3} 
                  defaultValue={showEditFood.description} 
                  required 
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price (KES)</Form.Label>
                    <Form.Control 
                      name="price" 
                      type="number" 
                      min="1" 
                      defaultValue={showEditFood.price} 
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Discount (%)</Form.Label>
                    <Form.Control 
                      name="discount" 
                      type="number" 
                      min="0" 
                      max="100" 
                      defaultValue={showEditFood.discount || 0} 
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Meal Type</Form.Label>
                <Form.Select name="mealType" defaultValue={showEditFood.mealType} required>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                  <option value="dessert">Dessert</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Update Images</Form.Label>
                <Form.Control name="images" type="file" multiple />
                <div className="d-flex gap-2 mt-2 flex-wrap">
                  {showEditFood.photoUrls.map((url, index) => (
                    <img 
                      key={index} 
                      src={url} 
                      alt={`Preview ${index + 1}`} 
                      className="img-thumbnail" 
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                    />
                  ))}
                </div>
                <Form.Text className="text-muted">Current images will be replaced</Form.Text>
              </Form.Group>

              <div className="d-flex justify-content-end mt-4 gap-2">
                <Button variant="secondary" onClick={() => setShowEditFood(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Food
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
