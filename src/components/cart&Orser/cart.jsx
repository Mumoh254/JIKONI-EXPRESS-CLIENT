// src/utils/orderUtils.js
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import popSound from '../../../public/audio/cliks.mp3';



  const playSound = () => {
    new Audio(popSound).play();
  };


export const updateCart = (setState, item, quantityChange, playSound) => {
  playSound();
  setState(prev => {
    const existingItem = prev.cart.find(i => i.id === item.id);
    let newCart = [...prev.cart];
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantityChange;
      if (newQuantity <= 0) {
        newCart = newCart.filter(i => i.id !== item.id);
      } else {
        newCart = newCart.map(i =>
          i.id === item.id ? { ...i, quantity: newQuantity } : i
        );
      }
    } else if (quantityChange > 0) {
      newCart.push({
        ...item,
        quantity: 1,
        price: Number(item.price)
      });
    }

    return { ...prev, cart: newCart };
  });
};

export const handlePreOrder = (setSelectedFood, setShowPreOrderModal, setPreOrderForm, food) => {
  setSelectedFood(food);
  setShowPreOrderModal(true);
  setPreOrderForm({
    date: '',
    time: '',
    instructions: '',
    servings: 1
  });
};

export const handleSubmitPreOrder = (
  selectedFood, preOrderForm, updateCartFn, setShowPreOrderModal
) => {
  const preOrderItem = {
    ...selectedFood,
    isPreOrder: true,
    preOrderDate: preOrderForm.date,
    preOrderTime: preOrderForm.time,
    instructions: preOrderForm.instructions,
    quantity: preOrderForm.servings
  };

  updateCartFn(preOrderItem, preOrderForm.servings);
  setShowPreOrderModal(false);
};

export const handleCheckout = (setState) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mockAddress = "123 Main St, Nairobi, Kenya";
        setState(prev => ({
          ...prev,
          showCart: false,
          showOrderConfirmation: true,
          userLocation: {
            lat: latitude,
            lng: longitude,
            address: mockAddress
          }
        }));
      },
      (error) => {
        setState(prev => ({
          ...prev,
          showOrderConfirmation: true,
          locationError: "Failed to get your location: " + error.message
        }));
      }
    );
  } else {
    setState(prev => ({
      ...prev,
      showOrderConfirmation: true,
      locationError: "Geolocation is not supported by your browser"
    }));
  }
};

export const handleConfirmOrder = (setState) => {
  Swal.fire({
    title: 'Order Confirmed!',
    text: 'Your order has been placed successfully',
    icon: 'success',
    confirmButtonText: 'Continue Shopping'
  }).then(() => {
    setState(prev => ({
      ...prev,
      cart: [],
      showOrderConfirmation: false
    }));
  });
};
