import { useState } from 'react';
import { useCart } from '../CartContext';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <div className="cart-page">
          <h2 className="cart-title">Shopping Cart</h2>
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <button className="add-to-cart-btn" style={{marginTop: '20px'}} onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="cart-page">
        <h2 className="cart-title">Shopping Cart</h2>
        
        {cartItems.map(item => (
          <div key={item.product_id} className="cart-item">
            <div className="cart-item-info">
              <div className="cart-item-name">{item.name}</div>
              <div className="cart-item-price">${item.price.toFixed(2)}</div>
            </div>
            <div className="cart-item-quantity">
              <button className="quantity-btn" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button className="quantity-btn" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
              <button 
                className="action-btn delete-btn" 
                onClick={() => removeFromCart(item.product_id)}
                style={{marginLeft: '10px'}}
              >
                Remove
              </button>
            </div>
            <div style={{fontWeight: 'bold', marginLeft: '20px'}}>
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}

        <div className="cart-total">
          <span className="total-label">Total: </span>
          <span className="total-amount">${getCartTotal().toFixed(2)}</span>
        </div>

        <button className="checkout-btn" onClick={() => navigate('/checkout')}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

export default Cart;
