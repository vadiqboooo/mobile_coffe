# Coffee Shop Server

FastAPI backend with SQLite + SQLAlchemy for the mobile coffee shop application.

## Setup

1. Create virtual environment:
```bash
cd server
python -m venv venv
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # macOS/Linux
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Public Endpoints
- `GET /api/drinks` - Get all drinks
- `GET /api/drinks/{drink_id}` - Get specific drink
- `GET /api/drinks/options/beans` - Get bean options
- `GET /api/drinks/options/milk` - Get milk options
- `GET /api/drinks/options/syrups` - Get syrup options
- `GET /api/users/{user_id}` - Get user
- `POST /api/users` - Create user
- `PUT /api/users/{user_id}` - Update user
- `GET /api/users/{user_id}/profile` - Get user profile with order history
- `GET /api/users/{user_id}/orders` - Get user orders
- `POST /api/users/{user_id}/orders` - Create new order

### Admin Endpoints (requires authentication)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/users` - Get all users
- `GET /api/admin/drinks` - Get all drinks (including inactive)
- `POST /api/admin/drinks` - Create new drink
- `PUT /api/admin/drinks/{drink_id}` - Update drink
- `DELETE /api/admin/drinks/{drink_id}` - Delete drink

## Admin Credentials

**Default login:**
- Username: `admin`
- Password: `admin123`

⚠️ **Change these in production!** Edit `routes/admin.py` to modify credentials.

## API Documentation

Interactive API docs available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database

SQLite database file `coffee_shop.db` is created automatically in the server folder.

## Admin Panel

Access the admin panel at: `http://localhost:5173/admin`

Features:
- View all orders and revenue statistics
- Manage users and their points
- CRUD operations for drinks (create, edit, activate/deactivate, delete)
