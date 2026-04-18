import { useState, useEffect } from 'react';
import { productApi, categoryApi } from '../api';
import { useCart } from '../CartContext';

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      productApi.getAll()
        .then(res => setProducts(res.data))
        .catch(err => console.error(err));
    } else {
      productApi.getByCategory(selectedCategory)
        .then(res => setProducts(res.data))
        .catch(err => console.error(err));
    }
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll()
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  if (loading) {
    return <div className="container"><p>Loading products...</p></div>;
  }

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category_id === parseInt(selectedCategory));

  return (
    <div className="container">
      <div className="filters">
        <select
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <p>No products found</p>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image"></div>
              <h3 className="product-name">{product.name}</h3>
              {product.structure && (
                <p className="product-description">{product.structure}</p>
              )}
              <p className="product-price">${parseFloat(product.price).toFixed(2)}</p>
              {product.weight && (
                <p className="product-stock">Weight: {product.weight}g</p>
              )}
              {product.calories && (
                <p className="product-stock">Calories: {product.calories}</p>
              )}
              <p className="product-stock">In stock: {product.stock_amount}</p>
              <button
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(product)}
                disabled={product.stock_amount === 0}
              >
                {product.stock_amount === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
