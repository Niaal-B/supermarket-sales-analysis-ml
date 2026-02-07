# API Endpoints

Complete API documentation for the Supermarket Sales Analysis System.

**Base URL:** `http://localhost:8000/api/`

**Authentication:** JWT Token (add to headers: `Authorization: Bearer <token>`)

---

## Authentication Endpoints

### POST `/api/auth/register/`
Register a new user.

**Request:**
```json
{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "staff",
    "shop_id": 1
}
```

**Response:**
```json
{
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "staff"
}
```

---

### POST `/api/auth/login/`
Login and get JWT token.

**Request:**
```json
{
    "username": "john_doe",
    "password": "password123"
}
```

**Response:**
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### GET `/api/auth/profile/`
Get current user profile.

**Response:**
```json
{
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "staff",
    "shop": {
        "id": 1,
        "name": "Main Store"
    }
}
```

---

## Shops Endpoints

### GET `/api/shops/`
Get list of shops.

**Query Parameters:**
- `is_active` (optional): Filter by active status

**Response:**
```json
[
    {
        "id": 1,
        "name": "Main Store",
        "address": "123 Main St",
        "phone": "1234567890",
        "is_active": true
    }
]
```

---

### GET `/api/shops/{id}/`
Get shop details.

**Response:**
```json
{
    "id": 1,
    "name": "Main Store",
    "address": "123 Main St",
    "phone": "1234567890",
    "email": "main@store.com",
    "is_active": true
}
```

---

## Products Endpoints

### GET `/api/products/`
Get list of products.

**Query Parameters:**
- `category_id` (optional): Filter by category
- `is_active` (optional): Filter by active status
- `search` (optional): Search by name

**Response:**
```json
[
    {
        "id": 1,
        "name": "Milk",
        "category": {
            "id": 1,
            "name": "Dairy"
        },
        "unit_price": "100.00",
        "barcode": "123456789"
    }
]
```

---

### POST `/api/products/`
Create a new product (Admin/Manager only).

**Request:**
```json
{
    "name": "Milk",
    "category_id": 1,
    "unit_price": 100.00,
    "barcode": "123456789"
}
```

---

## Inventory/Stock Endpoints

### GET `/api/inventory/`
Get stock levels.

**Query Parameters:**
- `shop_id` (required): Filter by shop
- `product_id` (optional): Filter by product
- `low_stock` (optional): Only show low stock items

**Response:**
```json
[
    {
        "id": 1,
        "shop": {
            "id": 1,
            "name": "Main Store"
        },
        "product": {
            "id": 1,
            "name": "Milk"
        },
        "quantity": 50,
        "min_threshold": 10,
        "is_low_stock": false
    }
]
```

---

### PUT `/api/inventory/{id}/`
Update stock quantity (Staff/Manager).

**Request:**
```json
{
    "quantity": 100,
    "min_threshold": 20
}
```

---

## Sales Endpoints

### POST `/api/sales/create/`
Create a new sale (bill) - Staff only.

**Request:**
```json
{
    "shop_id": 1,
    "items": [
        {
            "product_id": 1,
            "quantity": 2,
            "unit_price": 100.00
        },
        {
            "product_id": 2,
            "quantity": 1,
            "unit_price": 50.00
        }
    ],
    "discount": 10.00,
    "tax": 30.00,
    "payment_method": "cash"
}
```

**Response:**
```json
{
    "id": 123,
    "shop_id": 1,
    "transaction_date": "2024-01-15T10:30:00Z",
    "total_amount": "310.00",
    "discount": "10.00",
    "tax": "30.00",
    "final_amount": "330.00",
    "items": [
        {
            "product": {"id": 1, "name": "Milk"},
            "quantity": 2,
            "unit_price": "100.00",
            "subtotal": "200.00"
        }
    ]
}
```

**Note:** Stock is automatically updated when sale is created.

---

### GET `/api/sales/`
Get list of sales.

**Query Parameters:**
- `shop_id` (optional): Filter by shop
- `start_date` (optional): Filter from date (YYYY-MM-DD)
- `end_date` (optional): Filter to date (YYYY-MM-DD)
- `staff_id` (optional): Filter by staff

**Response:**
```json
[
    {
        "id": 123,
        "shop": {"id": 1, "name": "Main Store"},
        "staff": {"id": 2, "username": "john_doe"},
        "transaction_date": "2024-01-15T10:30:00Z",
        "total_amount": "310.00",
        "final_amount": "330.00",
        "payment_method": "cash"
    }
]
```

---

### GET `/api/sales/{id}/`
Get sale details with items.

**Response:**
```json
{
    "id": 123,
    "shop": {"id": 1, "name": "Main Store"},
    "transaction_date": "2024-01-15T10:30:00Z",
    "total_amount": "310.00",
    "discount": "10.00",
    "tax": "30.00",
    "final_amount": "330.00",
    "items": [
        {
            "id": 1,
            "product": {"id": 1, "name": "Milk"},
            "quantity": 2,
            "unit_price": "100.00",
            "subtotal": "200.00"
        }
    ]
}
```

---

## Stock Transfers Endpoints

### POST `/api/transfers/request/`
Request a stock transfer (Manager only).

**Request:**
```json
{
    "from_shop_id": 1,
    "to_shop_id": 2,
    "product_id": 1,
    "quantity": 50,
    "request_notes": "Need more stock at branch"
}
```

**Response:**
```json
{
    "id": 45,
    "from_shop": {"id": 1, "name": "Main Store"},
    "to_shop": {"id": 2, "name": "Branch Store"},
    "product": {"id": 1, "name": "Milk"},
    "quantity": 50,
    "status": "pending",
    "requested_at": "2024-01-15T10:30:00Z"
}
```

---

### GET `/api/transfers/`
Get list of transfers.

**Query Parameters:**
- `shop_id` (optional): Filter by shop
- `status` (optional): Filter by status (pending, approved, etc.)

---

### POST `/api/transfers/{id}/approve/`
Approve a transfer (Admin only).

**Request:**
```json
{
    "approval_notes": "Approved"
}
```

**Response:**
```json
{
    "id": 45,
    "status": "approved",
    "approved_at": "2024-01-15T11:00:00Z"
}
```

**Note:** Stock is automatically updated when transfer is approved.

---

### POST `/api/transfers/{id}/reject/`
Reject a transfer (Admin only).

---

## Analytics Endpoints

### GET `/api/analytics/overview/`
Get dashboard overview data.

**Query Parameters:**
- `shop_id` (optional): Filter by shop
- `start_date` (optional): Start date
- `end_date` (optional): End date

**Response:**
```json
{
    "total_revenue": "50000.00",
    "total_sales": 150,
    "total_items_sold": 500,
    "top_products": [
        {"product_id": 1, "name": "Milk", "quantity_sold": 100}
    ],
    "revenue_by_day": [
        {"date": "2024-01-15", "revenue": "5000.00"}
    ]
}
```

---

### GET `/api/analytics/trends/`
Get sales trends.

**Query Parameters:**
- `shop_id` (optional)
- `product_id` (optional)
- `period` (optional): `'daily'`, `'weekly'`, `'monthly'`

---

### GET `/api/analytics/export-sales-data/`
Export sales data for ML training.

**Query Parameters:**
- `start_date` (required): YYYY-MM-DD
- `end_date` (required): YYYY-MM-DD
- `shop_id` (optional)
- `product_id` (optional)

**Response:**
```json
[
    {
        "date": "2024-01-15",
        "product_id": 1,
        "shop_id": 1,
        "quantity": 10,
        "price": 100.00,
        "revenue": 1000.00
    }
]
```

---

## ML Prediction Endpoints

### GET `/api/analytics/predictions/`
Get ML predictions.

**Query Parameters:**
- `product_id` (optional): Filter by product
- `shop_id` (optional): Filter by shop
- `days` (optional): Number of days (default: 30)

**Response:**
```json
{
    "product_id": 1,
    "shop_id": 1,
    "predictions": [
        {
            "date": "2024-02-01",
            "predicted_demand": 150,
            "confidence": 0.85
        }
    ]
}
```

---

### POST `/api/ml/store-predictions/`
Store predictions from ML service (internal use).

**Request:**
```json
{
    "shop_id": 1,
    "product_id": 1,
    "predictions": [
        {
            "date": "2024-02-01",
            "predicted_demand": 150,
            "confidence": 0.85
        }
    ]
}
```

---

## Alerts Endpoints

### GET `/api/alerts/`
Get unread alerts.

**Query Parameters:**
- `shop_id` (optional): Filter by shop
- `severity` (optional): Filter by severity
- `is_read` (optional): `true` or `false`

**Response:**
```json
[
    {
        "id": 1,
        "shop": {"id": 1, "name": "Main Store"},
        "product": {"id": 1, "name": "Milk"},
        "alert_type": "low_stock",
        "message": "Stock is below threshold",
        "severity": "high",
        "is_read": false,
        "created_at": "2024-01-15T10:30:00Z"
    }
]
```

---

### PUT `/api/alerts/{id}/read/`
Mark alert as read.

**Response:**
```json
{
    "id": 1,
    "is_read": true,
    "read_at": "2024-01-15T11:00:00Z"
}
```

---

## Error Responses

All endpoints may return errors:

**400 Bad Request:**
```json
{
    "error": "Invalid input",
    "details": {...}
}
```

**401 Unauthorized:**
```json
{
    "error": "Authentication required"
}
```

**403 Forbidden:**
```json
{
    "error": "You don't have permission"
}
```

**404 Not Found:**
```json
{
    "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
    "error": "Internal server error"
}
```

