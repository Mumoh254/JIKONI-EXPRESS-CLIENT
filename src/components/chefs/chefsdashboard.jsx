import React, { useState, useEffect } from 'react';
import ChefDashboardHeader from './chefsDashboardHeader';
import FoodItemsTable from './foods/foodItemsTable';
import FoodPostForm from './foods/foodPostForm';
import EditFoodModal from './foods/foodEdit';
import AnalyticsSidebar from './analytics/chefsAnalytics';
import RidersSidebar from '../Rider/rider';
import { Button, Offcanvas } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const Toast = withReactContent(Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
}));

export default function ChefDashboard({ setIsChefMode }) {
  const [state, setState] = useState({
    foods: [],
    orders: [],
    riders: [],
    showFoodPost: false,
    showAnalytics: false,
    showBikers: false,
    showEditFood: null
  });

  useEffect(() => {
    setIsChefMode(true);
    return () => setIsChefMode(false);
  }, [setIsChefMode]);

  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        const foodsRes = await fetch('/api/foods');
        const foods = await foodsRes.json();
        
        const ordersRes = await fetch('/api/orders');
        const orders = await ordersRes.json();
        
        const ridersRes = await fetch('/api/riders');
        const riders = await ridersRes.json();
        
        setState(prev => ({
          ...prev,
          foods,
          orders,
          riders
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  const deleteFood = async (id) => {
    try {
      const response = await fetch(`/api/foods/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setState(prev => ({
          ...prev,
          foods: prev.foods.filter(food => food.id !== id)
        }));
        Toast.fire({ icon: 'success', title: 'Food deleted' });
      }
    } catch (error) {
      console.error('Error deleting food:', error);
      Toast.fire({ icon: 'error', title: 'Failed to delete food' });
    }
  };

  return (
    <div className="py-2">
      <ChefDashboardHeader setState={setState} />
      
      <FoodItemsTable 
        foods={state.foods} 
        setState={setState}
        deleteFood={deleteFood}
      />
      
      <Button 
        variant="success" 
        className="d-flex align-items-center rounded-pill px-4 py-2 mt-4 mx-auto"
        onClick={() => setState(s => ({ ...s, showFoodPost: true }))}
        style={{
          background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
          border: 'none',
          fontWeight: 600,
          boxShadow: '0 4px 15px rgba(46, 204, 113, 0.3)'
        }}
      >
        <Plus className="me-2" /> Post New Food
      </Button>
      
      <FoodPostForm 
        show={state.showFoodPost} 
        onHide={() => setState(s => ({ ...s, showFoodPost: false }))}
        setFoods={(newFood) => setState(prev => ({
          ...prev,
          foods: [...prev.foods, newFood]
        }))}
      />
      
      <EditFoodModal 
        show={!!state.showEditFood} 
        food={state.showEditFood}
        onHide={() => setState(s => ({ ...s, showEditFood: null }))}
        onUpdate={(updatedFood) => setState(prev => ({
          ...prev,
          foods: prev.foods.map(f => f.id === updatedFood.id ? updatedFood : f)
        }))}
      />
      
      <AnalyticsSidebar 
        show={state.showAnalytics} 
        onHide={() => setState(s => ({ ...s, showAnalytics: false }))}
        orders={state.orders}
      />
      
      <RidersSidebar 
        show={state.showBikers} 
        onHide={() => setState(s => ({ ...s, showBikers: false }))}
        riders={state.riders}
      />
    </div>
  );
}