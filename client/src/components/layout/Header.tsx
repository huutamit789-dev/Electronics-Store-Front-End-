import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext'; // Import useCart

export const CustomHeader: React.FC = () => {
  const { cart, loadingCart } = useCart();
  const totalItemsInCart = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-danger sticky-top shadow-sm">
      <div className="container-fluid">

      </div>
    </nav>
  );
};