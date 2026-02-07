# Setup Guide

Complete setup instructions for the Supermarket Sales Analysis System.

---

## Prerequisites

- Python 3.9 or higher
- PostgreSQL 12 or higher
- Node.js 16 or higher (for frontend)
- Git

---

## Backend Setup (Django)

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/sales-analysis.git
cd sales-analysis
```

### 2. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

If `requirements.txt` doesn't exist, install these:

```bash
pip install django djangorestframework django-cors-headers psycopg2-binary python-dotenv
```

### 4. Setup PostgreSQL Database

**Create database:**

```sql
CREATE DATABASE supermarket_db;
CREATE USER supermarket_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE supermarket_db TO supermarket_user;
```

### 5. Configure Environment Variables

Create `.env` file in `backend/`:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_NAME=supermarket_db
DATABASE_USER=supermarket_user
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

### 6. Run Migrations

```bash
python manage.py migrate
```

### 7. Create Superuser

```bash
python manage.py createsuperuser
```

### 8. Run Development Server

```bash
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`

---

## Frontend Setup (React)

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API URL

Create `.env` file in `frontend/`:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

### 4. Run Development Server

```bash
npm start
```

Frontend will be available at: `http://localhost:3000`

---

## ML Module Setup

### 1. Navigate to ML Module

```bash
cd backend/ml_module
```

### 2. Install ML Dependencies

Add to `backend/requirements.txt`:

```
pandas
numpy
scikit-learn
```

Then install:

```bash
pip install pandas numpy scikit-learn
```

### 3. Test ML Module

Create test file `test_predict.py`:

```python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'supermarket_analysis.settings')
django.setup()

from predict import predict_demand

# Test prediction
result = predict_demand(product_id=1, shop_id=1, days=7)
print(result)
```

Run:

```bash
python test_predict.py
```

---

## Docker Setup (Optional)

### 1. Build and Run

```bash
docker-compose up --build
```

### 2. Run Migrations

```bash
docker-compose exec backend python manage.py migrate
```

### 3. Create Superuser

```bash
docker-compose exec backend python manage.py createsuperuser
```

---

## Database Setup

### Load Sample Data (Optional)

```bash
python manage.py loaddata fixtures/sample_data.json
```

Or create data via Django admin:
1. Go to `http://localhost:8000/admin`
2. Login with superuser
3. Create shops, products, categories, etc.

---

## Project Structure

```
sales-analysis/
├── backend/
│   ├── apps/
│   │   ├── accounts/
│   │   ├── shops/
│   │   ├── products/
│   │   ├── sales/
│   │   ├── inventory/
│   │   ├── transfers/
│   │   └── analytics/
│   ├── ml_module/          # ML person works here
│   │   ├── __init__.py
│   │   └── predict.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   └── package.json
└── docker-compose.yml
```

---

## Troubleshooting

### Database Connection Error

- Check PostgreSQL is running
- Verify database credentials in `.env`
- Ensure database exists

### Port Already in Use

```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port
python manage.py runserver 8001
```

### Module Not Found

- Ensure virtual environment is activated
- Install missing dependencies: `pip install <package>`

### Migration Errors

```bash
# Reset migrations (careful - deletes data!)
python manage.py migrate --run-syncdb
```

---

## Next Steps

1. Read [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for database structure
2. Read [ML_INTERFACE.md](ML_INTERFACE.md) for ML function specs
3. Read [API_ENDPOINTS.md](API_ENDPOINTS.md) for API documentation
4. Read [COLLABORATION.md](COLLABORATION.md) for workflow

---

## Questions?

Contact the full-stack developer or create an issue on GitHub.

