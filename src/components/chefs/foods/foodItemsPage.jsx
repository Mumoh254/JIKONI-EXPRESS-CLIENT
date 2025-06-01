import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FoodItemsTable from './foodItemsTable';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import popSound from '../../../../public/audio/cliks.mp3';

const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";

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

export default function FoodItemsPage() {
  const [state, setState] = useState({
    foods: [],
    loading: true,
    error: null,
    showEditFood: null,
  });

  const deleteFood = async (id) => {
    playSound();
    try {
      await axios.delete(`${BASE_URL}/${id}`);
      setState(prev => ({
        ...prev,
        foods: prev.foods.filter(food => food.id !== id),
      }));
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

  const fetchFoods = async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const res = await axios.get(BASE_URL);
      const allFoods = res.data;

      const chefId = localStorage.getItem('chefId');

      const filteredFoods = chefId
        ? allFoods.filter(food => food.chef?.id === chefId)
        : allFoods;

      setState(prev => ({
        ...prev,
        foods: filteredFoods,
        loading: false,
        error: null,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message,
      }));
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  return (
    <div className="container py-4">
      <h3 className="mb-4">Food Items</h3>
      <FoodItemsTable
        foods={state.foods}
        loading={state.loading}
        setState={(updater) => {
          playSound();
          setState(prev => {
            const newState = typeof updater === 'function' ? updater(prev) : updater;
            if (newState.showEditFood) {
              Toast.fire({ icon: 'info', title: 'Edit mode activated' });
            }
            return newState;
          });
        }}
        deleteFood={deleteFood}
      />
      {state.error && (
        <div className="alert alert-danger mt-3">
          {state.error}
        </div>
      )}
    </div>
  );
}
