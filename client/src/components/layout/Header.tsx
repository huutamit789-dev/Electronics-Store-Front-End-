import React from 'react';
import { Link } from 'react-router-dom';

export const CustomHeader: React.FC = () => (
    <nav className="navbar navbar-expand-lg navbar-dark bg-danger sticky-top shadow-sm">
      <div className="container-fluid">
        {/* Logo */}
        <Link className="navbar-brand fw-bold fs-4" to="/">
          Electro Store
        </Link>

        {/* Search Bar */}
        <div className="d-flex flex-grow-1 mx-3">
          <div className="input-group">
            <input
                type="text"
                className="form-control border-0"
                placeholder="Bạn cần tìm gì?"
                aria-label="Search"
            />
            <button className="btn btn-light" type="button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>

        {/* User Icons */}
        <ul className="navbar-nav d-flex flex-row align-items-center">
          <li className="nav-item me-3">
            <Link className="nav-link text-white d-flex flex-column align-items-center" to="/cart">
              <i className="fas fa-shopping-cart fs-5"></i>
              <small>Giỏ hàng</small>
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white d-flex flex-column align-items-center" to="/login">
              <i className="fas fa-user fs-5"></i>
              <small>Đăng nhập</small>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
);