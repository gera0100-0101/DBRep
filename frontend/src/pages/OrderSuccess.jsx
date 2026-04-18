import { Link } from 'react-router-dom';

function OrderSuccess() {
  return (
    <div className="container">
      <div className="order-success">
        <div className="success-icon">✓</div>
        <h2>Order Placed Successfully!</h2>
        <p style={{marginTop: '16px', color: '#666'}}>
          Thank you for your order. We will deliver it soon.
        </p>
        <Link to="/" className="add-to-cart-btn" style={{display: 'inline-block', marginTop: '24px', textDecoration: 'none'}}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default OrderSuccess;
