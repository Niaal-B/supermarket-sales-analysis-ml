# Database Schema

Complete database structure for the Supermarket Sales Analysis System.

## Overview

The database uses PostgreSQL and follows Django ORM models. This document describes all tables and their relationships.

---

## Tables

### 1. Users Table

Extended Django User model with roles.

**Fields:**
- `id` - Primary Key
- `username` - Unique username
- `email` - Unique email
- `password` - Hashed password
- `role` - User role: `'admin'`, `'sales_manager'`, `'staff'`
- `phone` - Contact number (optional)
- `shop_id` - Foreign Key to Shops (nullable - admin may not have shop)
- `is_active` - Account status
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Relationships:**
- Many-to-One with Shop (users can work at a shop)

---

### 2. Shops Table

Supermarket shops/branches.

**Fields:**
- `id` - Primary Key
- `name` - Shop name
- `address` - Shop address
- `phone` - Contact number (optional)
- `email` - Email (optional)
- `is_active` - Shop status
- `created_at` - Timestamp
- `updated_at` - Timestamp

---

### 3. Categories Table

Product categories (Dairy, Bakery, etc.).

**Fields:**
- `id` - Primary Key
- `name` - Category name (unique)
- `description` - Category description (optional)
- `created_at` - Timestamp

---

### 4. Products Table

Product catalog.

**Fields:**
- `id` - Primary Key
- `name` - Product name
- `category_id` - Foreign Key to Categories (nullable)
- `description` - Product description (optional)
- `unit_price` - Price per unit (Decimal)
- `barcode` - Product barcode (unique, optional)
- `is_active` - Product status
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Relationships:**
- Many-to-One with Category

---

### 5. Stock Table

Stock levels for each product in each shop.

**Fields:**
- `id` - Primary Key
- `shop_id` - Foreign Key to Shops
- `product_id` - Foreign Key to Products
- `quantity` - Current stock quantity (Integer, >= 0)
- `min_threshold` - Low stock alert threshold (Integer, >= 0)
- `max_capacity` - Maximum storage capacity (Integer, optional)
- `last_updated` - Last update timestamp
- `created_at` - Timestamp

**Unique Constraint:** One stock record per product per shop (`shop_id`, `product_id`)

**Relationships:**
- Many-to-One with Shop
- Many-to-One with Product

---

### 6. StockHistory Table

Audit trail of all stock changes.

**Fields:**
- `id` - Primary Key
- `stock_id` - Foreign Key to Stock
- `previous_quantity` - Quantity before change
- `new_quantity` - Quantity after change
- `change_type` - Type of change: `'sale'`, `'transfer_in'`, `'transfer_out'`, `'manual'`, `'return'`
- `reference_id` - Related Sale ID or Transfer ID (optional)
- `notes` - Additional notes (optional)
- `changed_by_id` - Foreign Key to User (who made the change)
- `created_at` - Timestamp

**Relationships:**
- Many-to-One with Stock
- Many-to-One with User

---

### 7. Sales Table

Sales transaction header (bill/receipt).

**Fields:**
- `id` - Primary Key
- `shop_id` - Foreign Key to Shops
- `staff_id` - Foreign Key to Users (who made the sale)
- `transaction_date` - When sale occurred (DateTime)
- `total_amount` - Sum of all item subtotals (Decimal)
- `discount` - Discount amount (Decimal)
- `tax` - Tax amount (Decimal)
- `final_amount` - Amount to pay: `total_amount - discount + tax` (Decimal)
- `payment_method` - `'cash'`, `'card'`, `'upi'`, `'other'`
- `notes` - Additional notes (optional)
- `created_at` - Timestamp

**Relationships:**
- Many-to-One with Shop
- Many-to-One with User (staff)
- One-to-Many with SaleItem

**Calculation:**
```
total_amount = Sum of all SaleItem subtotals
final_amount = total_amount - discount + tax
```

---

### 8. SaleItems Table

Individual items in a sale (line items).

**Fields:**
- `id` - Primary Key
- `sale_id` - Foreign Key to Sales
- `product_id` - Foreign Key to Products
- `quantity` - Units sold (Integer, > 0)
- `unit_price` - Price per unit at time of sale (Decimal)
- `subtotal` - `quantity * unit_price` (Decimal)
- `created_at` - Timestamp

**Relationships:**
- Many-to-One with Sale
- Many-to-One with Product

**Calculation:**
```
subtotal = quantity * unit_price
```

---

### 9. StockTransfers Table

Inter-shop stock transfers.

**Fields:**
- `id` - Primary Key
- `from_shop_id` - Foreign Key to Shops (source)
- `to_shop_id` - Foreign Key to Shops (destination)
- `product_id` - Foreign Key to Products
- `quantity` - Units to transfer (Integer, > 0)
- `status` - `'pending'`, `'approved'`, `'rejected'`, `'completed'`, `'cancelled'`
- `requested_by_id` - Foreign Key to User (who requested)
- `approved_by_id` - Foreign Key to User (who approved, admin)
- `request_notes` - Request notes (optional)
- `approval_notes` - Approval notes (optional)
- `requested_at` - Timestamp
- `approved_at` - Timestamp (optional)
- `completed_at` - Timestamp (optional)

**Relationships:**
- Many-to-One with Shop (from_shop)
- Many-to-One with Shop (to_shop)
- Many-to-One with Product
- Many-to-One with User (requested_by)
- Many-to-One with User (approved_by)

---

### 10. Predictions Table

ML predictions for product demand.

**Fields:**
- `id` - Primary Key
- `shop_id` - Foreign Key to Shops
- `product_id` - Foreign Key to Products
- `predicted_demand` - Predicted quantity needed (Integer)
- `confidence` - Confidence score 0.0-1.0 (Float)
- `prediction_date` - Date being predicted (Date)
- `forecast_period` - Days ahead: 7, 30, 90 (Integer)
- `model_version` - ML model version used (String, optional)
- `created_at` - Timestamp

**Unique Constraint:** One prediction per shop, product, and date (`shop_id`, `product_id`, `prediction_date`)

**Relationships:**
- Many-to-One with Shop
- Many-to-One with Product

---

### 11. Alerts Table

System alerts (low stock, high demand, etc.).

**Fields:**
- `id` - Primary Key
- `shop_id` - Foreign Key to Shops
- `product_id` - Foreign Key to Products (nullable)
- `alert_type` - `'high_demand'`, `'low_stock'`, `'seasonal'`, `'stockout_risk'`
- `message` - Alert message (Text)
- `severity` - `'low'`, `'medium'`, `'high'`, `'critical'`
- `is_read` - Read status (Boolean)
- `read_by_id` - Foreign Key to User (who read it, optional)
- `read_at` - When read (DateTime, optional)
- `created_at` - Timestamp

**Relationships:**
- Many-to-One with Shop
- Many-to-One with Product (nullable)
- Many-to-One with User (read_by)

---

## Relationships Summary

| From | To | Type | Description |
|------|-----|------|-------------|
| User | Shop | Many-to-One | Users work at a shop |
| Stock | Shop | Many-to-One | Stock belongs to a shop |
| Stock | Product | Many-to-One | Stock is for a product |
| Sale | Shop | Many-to-One | Sale happens at a shop |
| Sale | User | Many-to-One | Sale made by staff |
| SaleItem | Sale | Many-to-One | Items belong to a sale |
| SaleItem | Product | Many-to-One | Item is a product |
| StockTransfer | Shop | Many-to-One (2x) | Transfer from/to shops |
| StockTransfer | Product | Many-to-One | Transfer is for a product |
| Prediction | Shop | Many-to-One | Prediction for a shop |
| Prediction | Product | Many-to-One | Prediction for a product |
| Alert | Shop | Many-to-One | Alert for a shop |
| Alert | Product | Many-to-One | Alert for a product (nullable) |

---

## Key Indexes

For performance optimization:

```sql
CREATE INDEX idx_sales_shop_date ON sales(shop_id, transaction_date);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_stock_shop_product ON stock(shop_id, product_id);
CREATE INDEX idx_predictions_shop_product ON predictions(shop_id, product_id, prediction_date);
CREATE INDEX idx_alerts_unread ON alerts(shop_id, is_read) WHERE is_read = FALSE;
```

---

## Data Flow Examples

### When a Bill is Created:
1. Create `Sale` record
2. Create `SaleItem` records (one per product)
3. Update `Stock.quantity` (decrease)
4. Create `StockHistory` record
5. Check if stock < threshold → create `Alert`

### When ML Prediction is Stored:
1. ML service calls API with predictions
2. Create `Prediction` records
3. Compare with `Stock.quantity`
4. If predicted > available → create `Alert`

---

## For ML Person

**Main tables you'll use:**
- **SaleItem** - Historical sales data (quantity, dates, prices)
- **Sale** - Transaction details (shop, date)
- **Product** - Product information
- **Stock** - Current inventory levels

**How to query sales data:**
```python
from apps.sales.models import SaleItem

sales = SaleItem.objects.filter(
    product_id=1,
    sale__shop_id=1,
    sale__transaction_date__gte='2024-01-01'
).values(
    'sale__transaction_date',
    'quantity',
    'unit_price',
    'subtotal',
    'sale__shop_id',
    'product_id'
)
```

See [ML_INTERFACE.md](ML_INTERFACE.md) for more details.

