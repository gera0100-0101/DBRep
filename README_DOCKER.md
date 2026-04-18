# Food Store Internet Shop - Dockerized

Full-stack internet food store with delivery, built with FastAPI, PostgreSQL, SQLAlchemy, React + Vite, and Docker.

## Features

- **Product Catalog**: Browse products with descriptions, prices, and images
- **Shopping Cart**: Add/remove products, adjust quantities
- **Checkout & Payment**: Complete orders with multiple payment options (card, cash, bank transfer)
- **Admin Panel**: Manage products (add, edit, delete), categories, and manufacturers
- **Order Management**: Track orders and delivery status

## Tech Stack

### Backend
- Python 3.11
- FastAPI
- PostgreSQL 15
- SQLAlchemy 2.0
- Pydantic

### Frontend
- React 18
- Vite
- React Router
- Axios

### DevOps
- Docker
- Docker Compose

## Project Structure

```
/workspace
├── backend/           # FastAPI application
│   ├── Dockerfile
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── db_session.py
│   ├── requirements.txt
│   └── routers/
├── frontend/          # React application
│   ├── Dockerfile
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── init.sql          # Database schema initialization
└── README.md
```

## Quick Start with Docker

### Prerequisites
- Docker (version 20+)
- Docker Compose (version 2.0+)

### Running the Application

1. **Clone or navigate to the project directory**:
   ```bash
   cd /workspace
   ```

2. **Start all services**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Stopping the Application

```bash
docker-compose down
```

To also remove volumes (database data):
```bash
docker-compose down -v
```

## Manual Setup (Without Docker)

### Backend Setup

1. **Install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set up PostgreSQL**:
   ```bash
   psql -U postgres -c "CREATE DATABASE food_store;"
   psql -U postgres -d food_store -f ../init.sql
   ```

3. **Configure database connection** (optional, default is localhost):
   Edit `backend/database.py` or set environment variable:
   ```bash
   export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/food_store
   ```

4. **Run the backend**:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## API Endpoints

### Products
- `GET /api/products/` - List all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products/` - Create product (admin)
- `PUT /api/products/{id}` - Update product (admin)
- `DELETE /api/products/{id}` - Delete product (admin)
- `GET /api/products/category/{category_id}` - Get products by category

### Categories
- `GET /api/categories/` - List all categories
- `POST /api/categories/` - Create category (admin)
- `DELETE /api/categories/{id}` - Delete category (admin)

### Manufacturers
- `GET /api/manufacturers/` - List all manufacturers
- `POST /api/manufacturers/` - Create manufacturer (admin)
- `DELETE /api/manufacturers/{id}` - Delete manufacturer (admin)

### Orders
- `POST /api/orders/checkout` - Create order and checkout
- `GET /api/orders/` - List all orders (admin)
- `GET /api/orders/{id}` - Get order by ID
- `PUT /api/orders/{id}/status` - Update order status (admin)

## Database Schema

The application uses a normalized PostgreSQL schema with the following tables:
- companies, shops
- categories, manufacturers
- products, product_image_groups, images
- customers, payments
- orders, order_items, checks
- workers, posts

See `init.sql` for the complete schema.

## Environment Variables

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://postgres:postgres@localhost:5432/food_store |

### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | /api (proxy) |

## Development

### Running Tests
```bash
# Backend tests (if implemented)
cd backend
pytest

# Frontend tests (if implemented)
cd frontend
npm test
```

### Hot Reload
- Backend: Auto-reloads on code changes when running with `--reload`
- Frontend: Vite provides instant hot module replacement

## Troubleshooting

### Port Already in Use
If ports 3000, 5432, or 8000 are already in use, modify `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change host port
```

### Database Connection Issues
Ensure PostgreSQL container is healthy:
```bash
docker-compose ps
docker-compose logs db
```

### Rebuilding Containers
```bash
docker-compose up --build --force-recreate
```

## License

MIT
