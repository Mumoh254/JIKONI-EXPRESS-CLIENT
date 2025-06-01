import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Card, Row, Col } from 'react-bootstrap';
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

  const deleteFood = async (id) => {
    playSound();
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Fetching food items...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Food Items</h3>
        <Button 
          variant="primary"
          onClick={() => setShowAddFood(true)}
        >
          <i className="bi bi-plus-lg me-2"></i> Post Food
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
        <Row className="g-4">
          {foods.map(food => (
            <Col key={food.id} md={6} lg={4}>
              <Card className="h-100 shadow-sm">
                <div style={{
                  height: '200px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <img
                    src={food.photoUrls[0]}
                    alt={food.title}
                    className="w-100 h-100 object-fit-cover"
                  />
                  {food.photoUrls.length > 1 && (
                    <span className="badge bg-dark position-absolute top-0 end-0 m-2">
                      +{food.photoUrls.length - 1}
                    </span>
                  )}
                  <div className="position-absolute bottom-0 start-0 m-2">
                    <Badge bg="primary">KES {food.price}</Badge>
                  </div>
                  {food.discount > 0 && (
                    <div className="position-absolute top-0 start-0 m-2">
                      <Badge bg="danger">{food.discount}% OFF</Badge>
                    </div>
                  )}
                </div>
                
                <Card.Body>
                  <Card.Title className="d-flex justify-content-between">
                    <span>{food.title}</span>
                    <Badge bg="info">{food.mealType}</Badge>
                  </Card.Title>
                  <Card.Text className="text-muted small mb-3">
                    {food.description}
                  </Card.Text>
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      {formatDistanceToNow(new Date(food.createdAt), { addSuffix: true })}
                    </small>
                    
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setShowEditFood(food)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => deleteFood(food.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add Food Modal */}
      <Modal show={showAddFood} onHide={() => setShowAddFood(false)} size="lg">
        <Modal.Header closeButton>
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
              <Form.Text>Select up to 5 images of your food</Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" onClick={() => setShowAddFood(false)} className="me-2">
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
        <Modal.Header closeButton>
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
                <Form.Text>Current images will be replaced</Form.Text>
              </Form.Group>

              <div className="d-flex justify-content-end mt-4">
                <Button variant="secondary" onClick={() => setShowEditFood(null)} className="me-2">
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