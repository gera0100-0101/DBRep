import { useState, useEffect } from 'react';
import { productApi, categoryApi, manufacturerApi, workerApi, orderApi } from '../api';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageForm, setImageForm] = useState({ link: '', file: null });
  const [editingImageId, setEditingImageId] = useState(null);
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
  
  const [workerForm, setWorkerForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    post_id: ''
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
      
      if (activeTab === 'workers') {
        const workersRes = await workerApi.getAll();
        setWorkers(workersRes.data);
      } else if (activeTab === 'orders') {
        const ordersRes = await orderApi.getAdminOrders();
        setOrders(ordersRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  
  useEffect(() => {
    loadData();
  }, [activeTab]);

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

  // Image management functions
  const handleOpenImageModal = async (product) => {
    setSelectedProduct(product);
    setImageForm({ link: '', file: null });
    setEditingImageId(null);
    try {
      const imagesRes = await productApi.getImages(product.id);
      setProductImages(imagesRes.data);
    } catch (error) {
      console.error('Error loading images:', error);
      setProductImages([]);
    }
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedProduct(null);
    setProductImages([]);
    setImageForm({ link: '', file: null });
    setEditingImageId(null);
  };

  const handleFileChange = (e) => {
    setImageForm({ ...imageForm, file: e.target.files[0], link: '' });
    setEditingImageId(null);
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!imageForm.file && !imageForm.link.trim()) {
      alert('Please select a file or enter a link');
      return;
    }
    
    try {
      if (editingImageId) {
        // Update image with file upload
        if (imageForm.file) {
          await productApi.updateImageWithFile(selectedProduct.id, editingImageId, imageForm.file);
        }
      } else {
        // Add new image with file upload
        if (imageForm.file) {
          await productApi.addImageWithFile(selectedProduct.id, imageForm.file);
        }
      }
      setImageForm({ link: '', file: null });
      setEditingImageId(null);
      const imagesRes = await productApi.getImages(selectedProduct.id);
      setProductImages(imagesRes.data);
      // Reset file input
      const fileInput = document.getElementById('imageFile');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image');
    }
  };

  const handleEditImage = (image) => {
    setImageForm({ link: image.link, file: null });
    setEditingImageId(image.id);
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      await productApi.deleteImage(selectedProduct.id, imageId);
      const imagesRes = await productApi.getImages(selectedProduct.id);
      setProductImages(imagesRes.data);
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  // Worker management functions
  const handleAddWorker = async (e) => {
    e.preventDefault();
    const workerData = {
      ...workerForm,
      post_id: workerForm.post_id ? parseInt(workerForm.post_id) : null
    };
    
    try {
      await workerApi.create(workerData);
      setWorkerForm({ full_name: '', email: '', phone_number: '', post_id: '' });
      const workersRes = await workerApi.getAll();
      setWorkers(workersRes.data);
    } catch (error) {
      console.error('Error adding worker:', error);
      alert('Failed to add worker');
    }
  };

  const handleDeleteWorker = async (id) => {
    if (!confirm('Are you sure you want to delete this worker?')) return;
    
    try {
      await workerApi.delete(id);
      const workersRes = await workerApi.getAll();
      setWorkers(workersRes.data);
    } catch (error) {
      console.error('Error deleting worker:', error);
      alert('Failed to delete worker');
    }
  };

  // Order management functions
  const handleAssignCourier = async (orderId, courierId) => {
    if (!courierId) return;
    
    try {
      await orderApi.assignCourier(orderId, parseInt(courierId));
      const ordersRes = await orderApi.getAdminOrders();
      setOrders(ordersRes.data);
      alert('Courier assigned successfully');
    } catch (error) {
      console.error('Error assigning courier:', error);
      alert('Failed to assign courier');
    }
  };

  return (
    <div className="container">
      <div className="admin-panel">
        <div className="admin-header">
          <h2 className="admin-title">Admin Panel</h2>
          <div className="admin-tabs">
            <button 
              className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              Products
            </button>
            <button 
              className={`tab-btn ${activeTab === 'workers' ? 'active' : ''}`}
              onClick={() => setActiveTab('workers')}
            >
              Workers
            </button>
            <button 
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
          </div>
        </div>

        {activeTab === 'products' && (
          <>
            <div className="admin-header">
              <h3 className="admin-subtitle">Products Management</h3>
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
                  <th>Images</th>
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
                        className="action-btn images-btn"
                        onClick={() => handleOpenImageModal(product)}
                      >
                        📷 Images
                      </button>
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
          </>
        )}

        {activeTab === 'workers' && (
          <>
            <div className="admin-header">
              <h3 className="admin-subtitle">Workers Management</h3>
            </div>
            
            <div className="worker-form">
              <h4>Add New Worker</h4>
              <form onSubmit={handleAddWorker}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="full_name">Full Name *</label>
                    <input
                      type="text"
                      id="full_name"
                      value={workerForm.full_name}
                      onChange={(e) => setWorkerForm({...workerForm, full_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={workerForm.email}
                      onChange={(e) => setWorkerForm({...workerForm, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone_number">Phone Number</label>
                    <input
                      type="text"
                      id="phone_number"
                      value={workerForm.phone_number}
                      onChange={(e) => setWorkerForm({...workerForm, phone_number: e.target.value})}
                    />
                  </div>
                </div>
                <button type="submit" className="save-btn">Add Worker</button>
              </form>
            </div>

            <table className="product-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map(worker => (
                  <tr key={worker.id}>
                    <td>{worker.id}</td>
                    <td>{worker.full_name}</td>
                    <td>{worker.email || '-'}</td>
                    <td>{worker.phone_number || '-'}</td>
                    <td>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteWorker(worker.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === 'orders' && (
          <>
            <div className="admin-header">
              <h3 className="admin-subtitle">Orders Management</h3>
            </div>

            <table className="product-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Courier</th>
                  <th>Address</th>
                  <th>Created At</th>
                  <th>Assign Courier</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer?.name || 'Unknown'}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.courier?.full_name || 'Not assigned'}</td>
                    <td>{order.delivery_address || '-'}</td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
                    <td>
                      <select
                        value={order.courier_id || ''}
                        onChange={(e) => handleAssignCourier(order.id, e.target.value)}
                        style={{ padding: '5px', borderRadius: '4px' }}
                      >
                        <option value="">Select Courier</option>
                        {workers.filter(w => w.post && w.post.name.toLowerCase().includes('courier')).map(courier => (
                          <option key={courier.id} value={courier.id}>
                            {courier.full_name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
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

      {showImageModal && (
        <div className="modal-overlay" onClick={handleCloseImageModal}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              Manage Images for: {selectedProduct?.name}
            </h3>
            
            <form onSubmit={handleAddImage} className="image-form">
              <div className="form-group">
                <label htmlFor="imageFile">Upload Image File</label>
                <input
                  type="file"
                  id="imageFile"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="image-link">Or Image URL</label>
                <input
                  type="url"
                  id="image-link"
                  value={imageForm.link}
                  onChange={(e) => setImageForm({...imageForm, link: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  disabled={!!imageForm.file}
                />
              </div>
              <button type="submit" className="save-btn">
                {editingImageId ? 'Update Image' : 'Add Image'}
              </button>
            </form>

            <div className="images-list">
              <h4>Current Images</h4>
              {productImages.length === 0 ? (
                <p className="no-images">No images yet. Add one above.</p>
              ) : (
                <div className="images-grid">
                  {productImages.map(image => (
                    <div key={image.id} className="image-item">
                      <img 
                        src={`${import.meta.env.VITE_API_URL}${image.link}`} 
                        alt="Product" 
                        style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} 
                        onError={(e) => {
                          console.error('Image load error:', e.target.src);
                          e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                      <div className="image-actions">
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => handleEditImage(image)}
                        >
                          Edit
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteImage(image.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={handleCloseImageModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
