import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';

export const CartIcon: React.FC = () => {
  const { cart } = useCart();
  const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <Link to="/cart" className="text-dark position-relative me-3">
      <i className="bi bi-cart3 fs-4"></i>
      {totalItems > 0 && (
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
          {totalItems}
          <span className="visually-hidden">items in cart</span>
        </span>
      )}
    </Link>
  );
};