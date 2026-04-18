import { useState } from 'react';
import { useCart } from '../CartContext';
import { orderApi } from '../api';
import { useNavigate } from 'react-router-dom';

function Checkout() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    payment_method: 'card'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const checkoutData = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone || null,
        delivery_address: formData.delivery_address,
        payment_method: formData.payment_method,
        items: cartItems
      };

      await orderApi.checkout(checkoutData);
      clearCart();
      navigate('/order-success');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <div className="checkout-form">
          <h2>Checkout</h2>
          <p>Your cart is empty</p>
          <button className="add-to-cart-btn" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <form className="checkout-form" onSubmit={handleSubmit}>
        <h2 style={{marginBottom: '20px'}}>Checkout</h2>
        
        <div className="form-group">
          <label htmlFor="customer_name">Full Name *</label>
          <input
            type="text"
            id="customer_name"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="customer_phone">Phone Number</label>
          <input
            type="tel"
            id="customer_phone"
            name="customer_phone"
            value={formData.customer_phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="delivery_address">Delivery Address *</label>
          <textarea
            id="delivery_address"
            name="delivery_address"
            value={formData.delivery_address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="payment_method">Payment Method *</label>
          <select
            id="payment_method"
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            required
          >
            <option value="card">Credit/Debit Card</option>
            <option value="cash">Cash on Delivery</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>

        <div style={{marginTop: '20px', padding: '16px', background: '#f9f9f9', borderRadius: '4px'}}>
          <strong>Order Total: ${getCartTotal().toFixed(2)}</strong>
        </div>

        <button type="submit" className="checkout-btn" disabled={loading} style={{marginTop: '20px'}}>
          {loading ? 'Processing...' : `Place Order - $${getCartTotal().toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}

export default Checkout;
