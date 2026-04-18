import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider, useCart } from './CartContext';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import AdminPanel from './pages/AdminPanel';

function Header() {
  const { getCartCount } = useCart();

  return (
    <header>
      <div className="container header-content">
        <Link to="/" className="logo" style={{color: 'white', textDecoration: 'none'}}>
          🛒 Food Store
        </Link>
        <nav>
          <Link to="/">Products</Link>
          <Link to="/admin">Admin</Link>
          <Link to="/cart" className="cart-icon">
            Cart
            {getCartCount() > 0 && (
              <span className="cart-count">{getCartCount()}</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

function AppContent() {
  return (
    <Router>
      <div>
        <Header />
        <main style={{paddingTop: '20px'}}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App;
