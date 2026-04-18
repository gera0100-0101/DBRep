# Food Store - Internet Shop with Delivery

A full-stack e-commerce application for food delivery built with FastAPI, PostgreSQL, SQLAlchemy, React, and Vite.

## Features

- **Product Catalog**: Browse products with filtering by category
- **Shopping Cart**: Add/remove products, update quantities
- **Checkout**: Complete orders with customer info and delivery address
- **Payment**: Multiple payment methods (Card, Cash, Bank Transfer)
- **Admin Panel**: Manage products (add, edit, delete)

## Tech Stack

### Backend
- Python 3.x
- FastAPI
- PostgreSQL
- SQLAlchemy (ORM)
- Pydantic

### Frontend
- React 18
- React Router DOM
- Axios
- Vite
- CSS3

## Project Structure

```
/workspace
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── models.py            # SQLAlchemy database models
│   ├── schemas.py           # Pydantic schemas
│   ├── database.py          # Database configuration
│   ├── db_session.py        # Database session management
│   ├── requirements.txt     # Python dependencies
│   └── routers/
│       ├── __init__.py
│       ├── products.py      # Product API endpoints
│       ├── orders.py        # Order API endpoints
│       ├── categories.py    # Category API endpoints
│       └── manufacturers.py # Manufacturer API endpoints
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        ├── CartContext.jsx
        ├── index.css
        └── pages/
            ├── Home.jsx
            ├── Cart.jsx
            ├── Checkout.jsx
            ├── OrderSuccess.jsx
            └── AdminPanel.jsx
```

## Database Schema

The application uses the provided PostgreSQL schema with tables:
- companies, shops
- categories, manufacturers
- products, product_image_groups, images
- customers, payments
- orders, order_items, checks
- posts, workers

## Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 12+

### Backend Setup

1. Navigate to backend directory:
```bash
cd /workspace/backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure database connection in `database.py`:
```python
DATABASE_URL = "postgresql://username:password@localhost:5432/food_store"
```

5. Create PostgreSQL database:
```sql
CREATE DATABASE food_store;
```

6. Run the server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd /workspace/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## API Endpoints

### Products
- `GET /api/products/` - List all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/category/{category_id}` - Get products by category
- `POST /api/products/` - Create product (admin)
- `PUT /api/products/{id}` - Update product (admin)
- `DELETE /api/products/{id}` - Delete product (admin)

### Orders
- `POST /api/orders/checkout` - Create new order
- `GET /api/orders/` - List all orders
- `GET /api/orders/{id}` - Get order by ID
- `PUT /api/orders/{id}/status` - Update order status

### Categories
- `GET /api/categories/` - List all categories
- `POST /api/categories/` - Create category
- `DELETE /api/categories/{id}` - Delete category

### Manufacturers
- `GET /api/manufacturers/` - List all manufacturers
- `POST /api/manufacturers/` - Create manufacturer
- `DELETE /api/manufacturers/{id}` - Delete manufacturer

## Usage

1. **Browse Products**: Visit homepage to see all available products
2. **Filter by Category**: Use the category dropdown to filter products
3. **Add to Cart**: Click "Add to Cart" button on any product
4. **View Cart**: Click "Cart" in header to review items
5. **Checkout**: Provide delivery details and payment method
6. **Admin Panel**: Visit `/admin` to manage products

## Sample Data

On first startup, the backend seeds sample data:
- Company: Fresh Market LLC
- Shop: Main street 10
- Categories: Drinks, Snacks
- Manufacturers: Coca Cola, Lays

You can add more products through the admin panel or API.
