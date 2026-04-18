import { useState, useEffect } from 'react';
import { productApi, categoryApi, manufacturerApi } from '../api';

function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    weight: '',
    calories: '',
    structure: '',
    stock_amount: 0,
    shop_id: 1,
    category_id: '',
    manufacturer_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes, manufacturersRes] = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll(),
        manufacturerApi.getAll()
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setManufacturers(manufacturersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        weight: product.weight?.toString() || '',
        calories: product.calories?.toString() || '',
        structure: product.structure || '',
        stock_amount: product.stock_amount,
        shop_id: product.shop_id,
        category_id: product.category_id?.toString() || '',
        manufacturer_id: product.manufacturer_id?.toString() || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        weight: '',
        calories: '',
        structure: '',
        stock_amount: 0,
        shop_id: 1,
        category_id: '',
        manufacturer_id: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      weight: formData.weight ? parseFloat(formData.weight) : null,
      calories: formData.calories ? parseFloat(formData.calories) : null,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      manufacturer_id: formData.manufacturer_id ? parseInt(formData.manufacturer_id) : null,
      stock_amount: parseInt(formData.stock_amount)
    };

    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, productData);
      } else {
        await productApi.create(productData);
      }
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productApi.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  return (
    <div className="container">
      <div className="admin-panel">
        <div className="admin-header">
          <h2 className="admin-title">Admin Panel - Products</h2>
          <button className="add-product-btn" onClick={() => handleOpenModal()}>
            Add Product
          </button>
        </div>

        <table className="product-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>${parseFloat(product.price).toFixed(2)}</td>
                <td>{product.stock_amount}</td>
                <td>
                  {categories.find(c => c.id === product.category_id)?.name || '-'}
                </td>
                <td>
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => handleOpenModal(product)}
                  >
                    Edit
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock_amount">Stock Amount *</label>
                <input
                  type="number"
                  id="stock_amount"
                  value={formData.stock_amount}
                  onChange={(e) => setFormData({...formData, stock_amount: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="weight">Weight (g)</label>
                <input
                  type="number"
                  step="0.001"
                  id="weight"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label htmlFor="calories">Calories</label>
                <input
                  type="number"
                  step="0.01"
                  id="calories"
                  value={formData.calories}
                  onChange={(e) => setFormData({...formData, calories: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label htmlFor="structure">Structure/Description</label>
                <textarea
                  id="structure"
                  value={formData.structure}
                  onChange={(e) => setFormData({...formData, structure: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label htmlFor="category_id">Category</label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="manufacturer_id">Manufacturer</label>
                <select
                  id="manufacturer_id"
                  value={formData.manufacturer_id}
                  onChange={(e) => setFormData({...formData, manufacturer_id: e.target.value})}
                >
                  <option value="">Select Manufacturer</option>
                  {manufacturers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
