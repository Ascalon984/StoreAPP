# Control Panel Implementation Plan - Atheris Marketplace

**Target:** Single Vendor Admin Dashboard  
**Tech Stack:** Next.js 14 + React 18 + Zustand + Tailwind CSS  
**Database:** PostgreSQL (recommended) atau MongoDB  
**Status:** Planning Phase  
**Last Updated:** May 19, 2026

---

## 📋 Table of Contents

1. Architecture Overview
2. Sidebar Navigation Structure
3. Module-by-Module Breakdown
4. Folder & Component Organization
5. Database Schema Design
6. API Endpoints Structure
7. State Management Strategy
8. Development Roadmap (Phased Approach)

---

# 1. Architecture Overview

## High-Level Structure

```
Control Panel (CP) App
├── Authentication (Login/Register Admin)
├── Dashboard
│   ├── Sales Metrics
│   ├── Recent Orders
│   ├── Top Products
│   └── Charts & Analytics
├── Main Content Area (Dynamic based on sidebar)
└── Settings & Logout

Sidebar Navigation
├── Dashboard
├── Products Management
├── Categories Management
├── Orders Management
├── Reviews Moderation
├── Banners Management
├── Promotions & Discounts
├── Chat Management
├── User Management
├── Analytics & Reports
└── Settings
```

## Admin Authentication

**Login Requirements:**

- Email + Password
- Role: 'admin' (single vendor = 1 admin)
- Session token (JWT)
- Protected routes with auth middleware

**Deployment Architecture:**

```
Frontend (CP) ← → Backend API
   (Port 3000)      (Port 3001 or /api routes)
       ↓
   PostgreSQL/MongoDB
```

---

# 2. Sidebar Navigation Structure

## Sidebar Layout

```
┌─────────────────────────────────┐
│  ATHERIS CONTROL PANEL          │
│  🏪 Admin Dashboard             │
├─────────────────────────────────┤
│                                 │
│ 🏠 Dashboard                    │ → /cp/dashboard
│ 📦 Products                     │ → /cp/products
│ 🏷️ Categories                  │ → /cp/categories
│ 📋 Orders                       │ → /cp/orders
│ ⭐ Reviews                      │ → /cp/reviews
│ 🎪 Banners                      │ → /cp/banners
│ 🎁 Promotions                   │ → /cp/promotions
│ 💬 Chat Management             │ → /cp/chat
│ 👥 Users                        │ → /cp/users
│ 📊 Analytics                    │ → /cp/analytics
│ ⚙️ Settings                     │ → /cp/settings
│                                 │
├─────────────────────────────────┤
│ [Profile] [Logout]             │
└─────────────────────────────────┘
```

## Sidebar Features

### Collapsible Sidebar (Mobile-responsive)

- **Desktop:** Full sidebar always visible
- **Mobile/Tablet:** Hamburger menu, collapsible sidebar
- **Active State:** Highlight current page
- **Icons + Labels:** Clear navigation

### Admin Profile Section

- Admin avatar/initials
- Admin name
- Store name display
- Last login timestamp

### Quick Actions

- Profile edit
- Change password
- Logout

---

# 3. Module-by-Module Breakdown

## MODULE 1: DASHBOARD

### Purpose

Central hub showing KPIs dan recent activity

### Components

```
Dashboard Page Layout:
├── Header
│   ├── Page Title: "Dashboard"
│   └── Quick Stats (4 cards)
│       ├── Total Revenue (This Month)
│       ├── Total Orders (This Month)
│       ├── Total Products
│       └── Total Users
├── Charts Section (Row 1)
│   ├── Sales Chart (Line/Bar) - Last 30 days
│   ├── Order Status Distribution (Pie/Donut)
│   └── Category Performance (Bar)
├── Charts Section (Row 2)
│   ├── Top 5 Products (Table)
│   ├── Top 5 Categories (Table)
│   └── Top 5 Users by Spending (Table)
├── Recent Activity
│   ├── Recent Orders (Last 10)
│   ├── Recent Reviews (Last 5)
│   └── Recent Users (Last 5)
└── Footer
    └── Last Updated timestamp
```

### Key Stats Cards

```typescript
interface DashboardCard {
  title: string; // "Total Revenue", "Total Orders", etc
  value: number | string; // "Rp 5.000.000" or "125"
  change: number; // +12% or -5%
  icon: string; // Lucide icon name
  color: string; // 'blue' | 'green' | 'red' | 'purple'
  trend: "up" | "down"; // Arrow direction
}
```

### Charts & Visualizations

**Tools:** Chart.js, Recharts, atau Victory.js

```
1. Sales Revenue Chart (Line)
   - X-axis: Days/Weeks
   - Y-axis: Revenue (Rp)
   - Period: 30 days / 3 months / 1 year (selectable)

2. Order Status Distribution (Pie)
   - Menunggu Bayar
   - Verifikasi
   - Dikonfirmasi
   - Dikemas
   - Dalam Pengiriman
   - Terkirim
   - Selesai
   - Dibatalkan

3. Product Performance (Bar)
   - Top 5-10 products by revenue
   - Sortable by units sold / revenue

4. Category Performance (Bar)
   - Revenue per category
   - Units sold per category
```

### Database Queries Needed

```sql
-- Monthly revenue
SELECT SUM(total_amount) FROM orders
WHERE status IN ('terkirim', 'selesai')
AND created_at >= DATE_TRUNC('month', NOW())

-- Total active products
SELECT COUNT(*) FROM products WHERE is_active = true

-- Total registered users
SELECT COUNT(*) FROM users

-- Order status distribution
SELECT status, COUNT(*) FROM orders GROUP BY status

-- Top 5 products by revenue
SELECT p.id, p.name, SUM(oi.quantity * oi.price) as revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id ORDER BY revenue DESC LIMIT 5
```

---

## MODULE 2: PRODUCT MANAGEMENT

### Purpose

Full CRUD untuk products, dengan variants & images

### Layout

```
Products Page:
├── Header
│   ├── Title: "Produk Katalog"
│   ├── Search Bar (by name/SKU)
│   ├── Filter Dropdown
│   │   ├── By Category
│   │   ├── By Status (active/inactive)
│   │   └── By Stock (in stock / low stock / out of stock)
│   ├── Sort Dropdown (name, price, sold, rating)
│   └── [+ Add New Product] Button
├── Bulk Actions
│   ├── Checkbox "Select All"
│   ├── Bulk Edit (category, price, discount)
│   ├── Bulk Delete
│   └── Bulk Export (CSV)
├── Products Table
│   ├── Checkbox (select row)
│   ├── Image (thumbnail)
│   ├── Name
│   ├── SKU
│   ├── Category
│   ├── Price
│   ├── Stock
│   ├── Status (active/inactive toggle)
│   ├── Sold Count
│   ├── Rating
│   └── Actions (Edit / Delete)
├── Pagination
│   ├── Rows per page dropdown
│   ├── Page numbers
│   └── Total items count
└── Export Button (CSV/Excel)
```

### Create/Edit Product Modal/Page

```
Product Form:
├── Basic Info Tab
│   ├── Product Name (required)
│   ├── SKU / Product Code (required, unique)
│   ├── Category Dropdown (required)
│   ├── Description (rich text editor)
│   ├── Status Toggle (active/inactive)
│   └── Is Featured Toggle
├── Pricing Tab
│   ├── Cost Price (Harga Pokok)
│   ├── Selling Price (required)
│   ├── Discount Percentage (0-100%)
│   ├── Calculated Discount Price (read-only)
│   ├── Margin Percentage (auto-calculated)
│   └── Is On Sale Toggle
├── Stock Tab
│   ├── Total Stock (required)
│   ├── Low Stock Warning Level
│   ├── Stock Status (display: "15 units")
│   └── Stock History Log (show last 10 adjustments)
├── Variants Tab
│   ├── [+ Add Variant] Button
│   ├── Variant List (table)
│   │   ├── Variant Name
│   │   ├── Stock per variant
│   │   ├── Price modifier (optional)
│   │   └── Actions (Edit / Delete)
│   └── Variant Form (modal)
│       ├── Variant Name
│       ├── Stock
│       └── Price Modifier (+ / -)
├── Images Tab
│   ├── Main Image (thumbnail)
│   ├── Image Gallery (max 3 images)
│   ├── Upload Area (drag & drop)
│   ├── Image Crop Tool
│   ├── Set as Main Image (radio)
│   ├── Image Order (drag reorder)
│   └── Image Preview
├── SEO Tab (optional)
│   ├── Meta Title
│   ├── Meta Description
│   ├── Meta Keywords
│   └── URL Slug
└── Buttons
    ├── [Save] (create/update)
    ├── [Preview]
    └── [Cancel]
```

### Database Tables

```sql
-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category_id UUID NOT NULL,
  description TEXT,
  cost_price DECIMAL(12,2),
  selling_price DECIMAL(12,2) NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  stock INT DEFAULT 0,
  low_stock_warning INT DEFAULT 10,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  sold_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Product Variants
CREATE TABLE product_variants (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  stock INT DEFAULT 0,
  price_modifier DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product Images
CREATE TABLE product_images (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_main BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Stock History (for audit trail)
CREATE TABLE stock_history (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL,
  variant_id UUID,
  previous_stock INT,
  new_stock INT,
  change_type VARCHAR(20), -- 'adjustment' | 'sold' | 'return'
  quantity_changed INT,
  reason TEXT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id),
  FOREIGN KEY (created_by) REFERENCES admin_users(id)
);
```

### API Endpoints

```typescript
// GET /api/cp/products
// Query: ?page=1&limit=20&category=xxx&status=active&sort=name
Response: { products: Product[], total: number, pages: number }

// POST /api/cp/products
Body: ProductCreateDTO
Response: { product: Product, message: string }

// GET /api/cp/products/[id]
Response: Product (with variants, images, stock history)

// PUT /api/cp/products/[id]
Body: ProductUpdateDTO
Response: { product: Product, message: string }

// DELETE /api/cp/products/[id]
Response: { success: boolean, message: string }

// POST /api/cp/products/bulk-delete
Body: { ids: string[] }
Response: { deleted: number, message: string }

// POST /api/cp/products/[id]/upload-image
Body: FormData (file)
Response: { imageUrl: string, productId: string }

// POST /api/cp/products/bulk-export
Query: ?format=csv&ids=xxx,yyy
Response: CSV file download
```

---

## MODULE 3: CATEGORY MANAGEMENT

### Purpose

Create, read, update, delete, dan organize product categories

### Layout

```
Categories Page:
├── Header
│   ├── Title: "Kategori Produk"
│   ├── Search Bar
│   └── [+ Tambah Kategori] Button
├── Category List (Drag-reorderable)
│   ├── Category Card
│   │   ├── Icon (select dari Lucide icons)
│   │   ├── Category Name
│   │   ├── Product Count
│   │   ├── Status (active/inactive toggle)
│   │   ├── Featured Toggle (show on home page)
│   │   └── Actions (Edit / Delete)
│   └── Drag handles untuk reorder
├── Reorder Info
│   └── "Drag kategori untuk mengubah urutan"
└── [Save Order] Button (appears after reorder)
```

### Create/Edit Category Modal

```
Category Form:
├── Category Name (required)
├── Icon Selection (dropdown / icon picker)
│   └── Preview icon
├── Display Order (drag handle)
├── Status Toggle (active/inactive)
├── Featured Toggle (show in category slider on home)
├── Description (optional)
├── Color Theme (for category page)
│   └── Color picker
├── Is Show in Home Toggle
└── Buttons
    ├── [Save]
    └── [Cancel]
```

### Database Tables

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  color_theme VARCHAR(7), -- hex color
  description TEXT,
  sort_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

```typescript
// GET /api/cp/categories
Response: { categories: Category[], total: number }

// POST /api/cp/categories
Body: { name, icon, sort_order, is_featured, is_active }
Response: Category

// PUT /api/cp/categories/[id]
Body: Partial<Category>
Response: Category

// DELETE /api/cp/categories/[id]
Response: { success: boolean }

// PUT /api/cp/categories/reorder
Body: { categories: Array<{id: string, sort_order: number}> }
Response: { success: boolean }
```

---

## MODULE 4: ORDERS MANAGEMENT

### Purpose

View, filter, update order status, handle cancellations & refunds

### Layout

```
Orders Page:
├── Header
│   ├── Title: "Pesanan"
│   ├── Quick Filters (Tab-style)
│   │   ├── All
│   │   ├── Menunggu Bayar
│   │   ├── Verifikasi
│   │   ├── Dikonfirmasi
│   │   ├── Dikemas
│   │   ├── Dalam Pengiriman
│   │   ├── Terkirim
│   │   ├── Selesai
│   │   └── Dibatalkan
│   ├── Search (Order ID)
│   ├── Date Range Picker
│   ├── Advanced Filter Button
│   └── Export Button
├── Orders Table
│   ├── Order ID (clickable)
│   ├── Customer Name
│   ├── Items Count
│   ├── Order Date
│   ├── Total Amount
│   ├── Payment Method
│   ├── Status (badge with color)
│   ├── Actions (View / Edit Status / Cancel / Refund)
│   └── ... (more columns)
├── Pagination
└── (Total orders, Total revenue this view)
```

### Order Detail View/Modal

```
Order Detail Page:
├── Header
│   ├── Order ID
│   ├── Order Date
│   ├── Status (changeable dropdown)
│   └── [Close Button]
├── Customer Info Section
│   ├── Customer Name
│   ├── Email
│   ├── Phone
│   ├── Address (delivery)
│   └── [View Full Profile] Link
├── Items Section
│   ├── Table
│   │   ├── Product Image
│   │   ├── Product Name
│   │   ├── Variant (if any)
│   │   ├── Quantity
│   │   ├── Unit Price
│   │   ├── Discount
│   │   └── Subtotal
│   └── Total, Shipping, Grand Total
├── Payment Section
│   ├── Payment Method (COD / E-wallet / Bank Transfer)
│   ├── Payment Status (pending / confirmed / failed)
│   ├── Payment Proof (image upload for confirmation)
│   └── Confirm Payment Button (if pending)
├── Shipping Section
│   ├── Courier (if selected)
│   ├── Tracking Number (if shipped)
│   ├── Estimated Delivery Date
│   └── [View Tracking] Link
├── Order Timeline
│   ├── Status History (vertical timeline)
│   │   ├── Created
│   │   ├── Payment Confirmed
│   │   ├── Order Confirmed
│   │   ├── Packed
│   │   ├── Shipped (with tracking)
│   │   └── Delivered
│   └── Timestamps for each status
├── Customer Notes
│   ├── Special requests from customer
│   ├── Internal notes (admin-only)
│   └── [Add Note] Button
├── Actions
│   ├── [Update Status] Dropdown
│   ├── [Print Invoice]
│   ├── [Send Notification] (to customer)
│   ├── [Cancel Order]
│   ├── [Process Refund]
│   └── [Close]
└── Chat with Customer Link
    └── [Hubungi Customer]
```

### Status Update Workflow

```
Menunggu Bayar:
├── Actions: [Confirm Payment] [Cancel Order]
└── Confirmation: Admin verify bukti pembayaran

Pembayaran Verifikasi:
├── Actions: [Confirm Payment] [Reject] [Cancel]
└── Next status: Pesanan Dikonfirmasi

Pesanan Dikonfirmasi:
├── Actions: [Move to Packed]
└── Send notification to customer

Sedang Dikemas:
├── Actions: [Mark as Ready] [Hold]
└── Update customer: sedang dikemas

Siap Dikirim:
├── Actions: [Ship] [Hold]
└── Choose courier, generate tracking

Dalam Pengiriman:
├── Actions: [Mark as Delivered] [Tracking Update]
└── Real-time tracking updates

Terkirim:
├── Actions: [Complete Order]
└── Customer can now review

Selesai:
├── Actions: [View Reviews]
└── Customer has reviewed

Dibatalkan:
├── Reason: (documented)
├── Refund Status: (processed/pending)
└── Actions: [View Refund Details]
```

### Database Tables

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  status VARCHAR(30) DEFAULT 'menunggu_bayar',
  payment_method VARCHAR(30), -- 'cod' | 'ewallet' | 'bank'
  payment_status VARCHAR(20) DEFAULT 'pending',
  total_amount DECIMAL(12,2) NOT NULL,
  shipping_cost DECIMAL(10,2),
  discount_amount DECIMAL(10,2) DEFAULT 0,
  grand_total DECIMAL(12,2) NOT NULL,
  delivery_name VARCHAR(100),
  delivery_phone VARCHAR(20),
  delivery_address TEXT,
  delivery_lat DECIMAL(10,8),
  delivery_lng DECIMAL(11,8),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  product_id UUID NOT NULL,
  variant_id UUID,
  quantity INT NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

CREATE TABLE order_status_history (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  old_status VARCHAR(30),
  new_status VARCHAR(30) NOT NULL,
  changed_by UUID, -- admin id
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (changed_by) REFERENCES admin_users(id)
);

CREATE TABLE order_payments (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  payment_method VARCHAR(30),
  reference_number VARCHAR(100),
  proof_image_url VARCHAR(500),
  confirmed_at TIMESTAMP,
  confirmed_by UUID,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (confirmed_by) REFERENCES admin_users(id)
);

CREATE TABLE order_shipments (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  courier VARCHAR(50),
  tracking_number VARCHAR(100),
  estimated_delivery_date DATE,
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

### API Endpoints

```typescript
// GET /api/cp/orders
Query: ?status=xxx&page=1&limit=20&date_from=&date_to=&search=
Response: { orders: Order[], total: number, totalRevenue: number }

// GET /api/cp/orders/[id]
Response: Order (with items, payment, shipment, history)

// PUT /api/cp/orders/[id]/status
Body: { status: string, notes?: string }
Response: Order (updated)

// POST /api/cp/orders/[id]/confirm-payment
Body: { proofImageUrl?: string }
Response: Order (with payment confirmed)

// PUT /api/cp/orders/[id]/ship
Body: { courier: string, trackingNumber: string, estimatedDate: date }
Response: Order (shipment updated)

// POST /api/cp/orders/[id]/cancel
Body: { reason: string }
Response: { success: boolean, refundStatus: string }

// POST /api/cp/orders/[id]/refund
Body: { amount: number, reason: string }
Response: Refund (with processing details)

// POST /api/cp/orders/[id]/notify-customer
Body: { message: string, type: 'status' | 'custom' }
Response: { sent: boolean }

// POST /api/cp/orders/export
Query: ?format=csv&status=xxx&date_from=
Response: CSV file download
```

---

## MODULE 5: REVIEWS MODERATION

### Purpose

Approve/reject/delete customer reviews

### Layout

```
Reviews Page:
├── Header
│   ├── Title: "Review & Rating"
│   ├── Filter Tabs
│   │   ├── All
│   │   ├── Pending (need approval)
│   │   ├── Approved
│   │   └── Rejected
│   ├── Sort Dropdown (newest, helpful, rating)
│   └── Search (product name)
├── Reviews List
│   ├── Review Card
│   │   ├── Product Image
│   │   ├── Product Name
│   │   ├── Customer Name (censored)
│   │   ├── Rating (stars)
│   │   ├── Comment Preview (truncated)
│   │   ├── Date
│   │   ├── Helpful Count
│   │   ├── Status Badge (pending/approved/rejected)
│   │   └── Actions (View Full / Approve / Reject / Delete)
│   └── ... (more reviews)
├── Pagination
└── Stats
    └── Total reviews, Approval rate, etc
```

### Review Detail Modal

```
Review Detail:
├── Product Info
│   ├── Product Image
│   ├── Product Name
│   └── Category
├── Customer Info
│   ├── Username (partial censored)
│   ├── User Avatar (if any)
│   └── Account Created Date
├── Review Content
│   ├── Rating (1-5 stars)
│   ├── Full Comment
│   ├── Review Date
│   └── Helpful Votes (likes/dislikes)
├── Review Media (if attached)
│   ├── Images (grid)
│   └── Videos (if any)
├── Moderation Actions
│   ├── Status Dropdown (Pending / Approved / Rejected)
│   ├── Rejection Reason (if rejecting)
│   │   ├── Spam
│   │   ├── Inappropriate content
│   │   ├── Offensive language
│   │   └── Not relevant
│   ├── Admin Notes (optional)
│   ├── [Approve Button]
│   ├── [Reject Button]
│   └── [Delete Button]
├── Related Reviews (same product)
└── [Close]
```

### Database Tables

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL,
  user_id UUID NOT NULL,
  order_id UUID,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT NOT NULL,
  images_urls TEXT[], -- JSON array of image URLs
  video_urls TEXT[],
  likes INT DEFAULT 0,
  dislikes INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  rejection_reason VARCHAR(100),
  is_verified_purchase BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  approved_by UUID,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (approved_by) REFERENCES admin_users(id)
);

CREATE TABLE review_votes (
  id UUID PRIMARY KEY,
  review_id UUID NOT NULL,
  user_id UUID NOT NULL,
  vote_type VARCHAR(10), -- 'like' | 'dislike'
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  UNIQUE(review_id, user_id) -- One vote per user per review
);
```

### API Endpoints

```typescript
// GET /api/cp/reviews
Query: ?status=pending&page=1&limit=20
Response: { reviews: Review[], total: number }

// GET /api/cp/reviews/[id]
Response: Review (with full details)

// PUT /api/cp/reviews/[id]/status
Body: { status: 'approved' | 'rejected', reason?: string, notes?: string }
Response: Review (updated)

// DELETE /api/cp/reviews/[id]
Response: { success: boolean }

// GET /api/cp/reviews/stats
Response: { total: number, pending: number, approved: number, rejected: number }
```

---

## MODULE 6: BANNERS MANAGEMENT

### Purpose

Upload, manage, schedule, dan track banners untuk home page carousel

### Layout

```
Banners Page:
├── Header
│   ├── Title: "Banner Carousel"
│   ├── Info: "Carousel auto-play every 5 seconds"
│   └── [+ Tambah Banner] Button
├── Drag-reorderable Banner List
│   ├── Banner Item
│   │   ├── Drag Handle
│   │   ├── Banner Preview (thumbnail)
│   │   ├── Title
│   │   ├── Status (active/inactive toggle)
│   │   ├── Schedule Info (if scheduled)
│   │   ├── Click Count (analytics)
│   │   └── Actions (Edit / Delete)
│   └── ... (more banners)
└── [Save Order] Button
```

### Create/Edit Banner Modal

```
Banner Form:
├── Banner Title (required)
├── Image Upload
│   ├── Drag & drop area
│   ├── Image Preview
│   ├── Image dimensions (recommended: 1080x600px)
│   └── Image Crop Tool
├── Link Configuration
│   ├── Link Type Dropdown
│   │   ├── External URL
│   │   ├── Product Detail
│   │   ├── Category Page
│   │   └── None (image only)
│   └── Link Target (input/dropdown based on type)
├── Schedule
│   ├── Start Date/Time
│   ├── End Date/Time
│   ├── Active Toggle (show immediately or scheduled)
│   └── Repeat (one-time or recurring)
├── Display Settings
│   ├── Status (active/inactive)
│   ├── Position Order (drag handle)
│   └── Preview on Home
└── Buttons
    ├── [Save]
    ├── [Preview]
    └── [Cancel]
```

### Database Tables

```sql
CREATE TABLE banners (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  link_type VARCHAR(30), -- 'url' | 'product' | 'category' | 'none'
  link_target VARCHAR(500), -- URL or product/category ID
  sort_order INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active', -- 'active' | 'inactive' | 'scheduled'
  scheduled_start TIMESTAMP,
  scheduled_end TIMESTAMP,
  is_scheduled BOOLEAN DEFAULT false,
  click_count INT DEFAULT 0,
  impression_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE banner_analytics (
  id UUID PRIMARY KEY,
  banner_id UUID NOT NULL,
  date DATE,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  ctr DECIMAL(5,2), -- click through rate
  FOREIGN KEY (banner_id) REFERENCES banners(id) ON DELETE CASCADE,
  UNIQUE(banner_id, date)
);
```

### API Endpoints

```typescript
// GET /api/cp/banners
Response: { banners: Banner[] }

// POST /api/cp/banners
Body: BannerCreateDTO (with file upload)
Response: Banner

// PUT /api/cp/banners/[id]
Body: Partial<Banner>
Response: Banner

// DELETE /api/cp/banners/[id]
Response: { success: boolean }

// PUT /api/cp/banners/reorder
Body: { banners: Array<{id, sort_order}> }
Response: { success: boolean }

// GET /api/cp/banners/[id]/analytics
Query: ?date_from=&date_to=
Response: { analytics: BannerAnalytics[] }
```

---

## MODULE 7: PROMOTIONS & DISCOUNTS

### Purpose

Create dan manage promo codes, discount campaigns, flash sales

### Layout

```
Promotions Page:
├── Header
│   ├── Title: "Promosi & Diskon"
│   ├── Filter Tabs
│   │   ├── All
│   │   ├── Active
│   │   ├── Scheduled
│   │   ├── Expired
│   │   └── Archived
│   └── [+ Buat Promosi] Button
├── Promo List
│   ├── Promo Card
│   │   ├── Promo Code (if code-based)
│   │   ├── Title
│   │   ├── Discount Type (percentage / fixed / buy-get)
│   │   ├── Discount Value
│   │   ├── Period (start - end date)
│   │   ├── Status Badge (active/scheduled/expired)
│   │   ├── Usage Count (used / max)
│   │   └── Actions (Edit / Pause / Delete)
│   └── ... (more promos)
└── Pagination
```

### Create/Edit Promotion Modal

```
Promotion Form:
├── Basic Info
│   ├── Promo Title (required)
│   ├── Promo Code (optional, auto-generate or manual)
│   └── Description
├── Discount Type
│   ├── Radio Button: Percentage / Fixed Amount / Buy-Get
│   ├── Discount Value (% or Rp)
│   ├── Min Purchase (if any)
│   └── Max Discount Cap (if percentage)
├── Scope
│   ├── Apply To
│   │   ├── All Products
│   │   ├── Specific Category (multi-select)
│   │   ├── Specific Products (multi-select)
│   │   └── Specific Users (optional)
│   └── Usage Rules
│       ├── Max Uses (unlimited or number)
│       ├── Max Per User (unlimited or number)
│       └── Exclude Products/Categories
├── Period
│   ├── Start Date/Time
│   ├── End Date/Time
│   └── Recurring (one-time or yearly)
├── Status
│   ├── Active Toggle
│   └── Scheduled (show immediately or at date)
└── Buttons
    ├── [Save]
    ├── [Preview]
    └── [Cancel]
```

### Database Tables

```sql
CREATE TABLE promotions (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20), -- 'percentage' | 'fixed' | 'buy_get'
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2),
  max_discount_cap DECIMAL(10,2),
  scope_type VARCHAR(30), -- 'all' | 'category' | 'product' | 'user'
  scope_ids TEXT[], -- JSON array of category/product IDs
  applicable_user_ids TEXT[], -- JSON array of user IDs (if specific users)
  max_uses INT,
  max_uses_per_user INT DEFAULT 1,
  current_uses INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  is_scheduled BOOLEAN DEFAULT false,
  scheduled_start TIMESTAMP,
  scheduled_end TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE promo_usage (
  id UUID PRIMARY KEY,
  promo_id UUID NOT NULL,
  order_id UUID,
  user_id UUID,
  discount_amount DECIMAL(10,2),
  used_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (promo_id) REFERENCES promotions(id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### API Endpoints

```typescript
// GET /api/cp/promotions
Query: ?status=active&page=1&limit=20
Response: { promotions: Promotion[], total: number }

// POST /api/cp/promotions
Body: PromotionCreateDTO
Response: Promotion

// PUT /api/cp/promotions/[id]
Body: Partial<Promotion>
Response: Promotion

// DELETE /api/cp/promotions/[id]
Response: { success: boolean }

// PUT /api/cp/promotions/[id]/pause
Response: Promotion (is_active set to false)

// GET /api/cp/promotions/[id]/usage
Query: ?date_from=&date_to=
Response: { usage: PromoUsage[], total: number, totalDiscount: number }
```

---

## MODULE 8: CHAT MANAGEMENT

### Purpose

View, manage, dan respond to customer chats

### Layout

```
Chat Management Page:
├── Header
│   ├── Title: "Manajemen Chat"
│   ├── Search (by customer name/order ID)
│   ├── Filter Tabs
│   │   ├── All
│   │   ├── Unanswered (new messages)
│   │   ├── Waiting (pending response)
│   │   └── Resolved
│   └── Sort (newest/oldest)
├── Chat List (Left sidebar)
│   ├── Chat Room Item
│   │   ├── Customer Avatar
│   │   ├── Customer Name
│   │   ├── Last Message Preview
│   │   ├── Timestamp
│   │   ├── Unread Badge (if new messages)
│   │   └── Status Indicator (online/offline)
│   └── ... (more chats)
├── Chat Detail (Main area)
│   ├── Chat Header
│   │   ├── Customer Name
│   │   ├── Chat Type (CS / Product / Order)
│   │   ├── Context Info (product/order snippet)
│   │   └── Resolve Button
│   ├── Message Thread
│   │   ├── Message Bubble (customer)
│   │   ├── Message Bubble (admin)
│   │   ├── Timestamp
│   │   └── Message Status (sent/read)
│   ├── Quick Reply Chips (contextual)
│   ├── Chat Input Area
│   │   ├── Message Input
│   │   ├── Attachment Button
│   │   └── [Send] Button
│   └── Chat Actions
│       ├── [Assign to Staff] (if needed)
│       ├── [Add Tag/Label]
│       └── [Resolve Chat]
└── Pagination (for chat list)
```

### Database Tables

```sql
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  admin_id UUID,
  room_type VARCHAR(30), -- 'cs' | 'product' | 'order'
  context_id UUID, -- product_id or order_id
  status VARCHAR(20) DEFAULT 'open', -- 'open' | 'waiting' | 'resolved'
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (admin_id) REFERENCES admin_users(id)
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY,
  room_id UUID NOT NULL,
  sender_type VARCHAR(20), -- 'user' | 'admin'
  sender_id UUID,
  message_type VARCHAR(20), -- 'text' | 'image' | 'product' | 'order'
  content TEXT,
  media_url VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE
);

CREATE TABLE quick_replies (
  id UUID PRIMARY KEY,
  title VARCHAR(100),
  content TEXT,
  context VARCHAR(30), -- 'cs' | 'product' | 'order'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

```typescript
// GET /api/cp/chats
Query: ?status=open&page=1&limit=20
Response: { rooms: ChatRoom[], total: number }

// GET /api/cp/chats/[roomId]
Response: ChatRoom (with messages, context info)

// GET /api/cp/chats/[roomId]/messages
Query: ?page=1&limit=50
Response: { messages: Message[], total: number }

// POST /api/cp/chats/[roomId]/messages
Body: { content: string, mediaUrl?: string }
Response: Message

// PUT /api/cp/chats/[roomId]/status
Body: { status: 'open' | 'waiting' | 'resolved' }
Response: ChatRoom

// POST /api/cp/chats/[roomId]/assign
Body: { adminId: string }
Response: ChatRoom

// GET /api/cp/quick-replies
Response: QuickReply[]

// POST /api/cp/quick-replies
Body: QuickReplyDTO
Response: QuickReply
```

---

## MODULE 9: USER MANAGEMENT

### Purpose

View, manage, verify, suspend user accounts

### Layout

```
Users Page:
├── Header
│   ├── Title: "Manajemen User"
│   ├── Search (by name/email)
│   ├── Filter Tabs
│   │   ├── All
│   │   ├── Active
│   │   ├── Suspended
│   │   └── Unverified
│   ├── Sort (newest/most purchases)
│   └── Export Button
├── Users Table
│   ├── User ID
│   ├── Name
│   ├── Email
│   ├── Phone
│   ├── Registration Date
│   ├── Last Login
│   ├── Total Orders
│   ├── Total Spent
│   ├── Status (active/suspended/unverified)
│   └── Actions (View / Edit / Suspend / Delete)
├── Pagination
└── Stats
    └── Total users, active, suspended
```

### User Detail Page

```
User Profile:
├── Basic Info
│   ├── User ID
│   ├── Username
│   ├── Full Name
│   ├── Email
│   ├── Phone
│   ├── Avatar
│   ├── Registration Date
│   └── Last Login
├── Account Status
│   ├── Status (active/suspended/unverified)
│   ├── Reason (if suspended)
│   └── [Suspend] or [Activate] Button
├── Profile Completion
│   ├── Completion percentage
│   ├── Missing fields
│   └── [Force Verification] Button
├── Activity
│   ├── Total Orders
│   ├── Total Spent
│   ├── Total Reviews
│   ├── Avg Rating Given
│   └── [View Orders] Link
├── Addresses
│   ├── Address List
│   ├── Default Address
│   └── [View/Edit Addresses] Button
├── Admin Actions
│   ├── [View Order History]
│   ├── [View Reviews]
│   ├── [Reset Password]
│   ├── [View Chat History]
│   ├── [Suspend/Activate]
│   └── [Delete User]
└── [Back to Users List]
```

### Database Tables

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  phone VARCHAR(15),
  password_hash VARCHAR(255),
  avatar_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'active', -- 'active' | 'suspended' | 'unverified'
  suspension_reason TEXT,
  is_email_verified BOOLEAN DEFAULT false,
  is_phone_verified BOOLEAN DEFAULT false,
  completion_percentage INT DEFAULT 0,
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(15,2) DEFAULT 0,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Other user tables (addresses, preferences) already defined
```

### API Endpoints

```typescript
// GET /api/cp/users
Query: ?status=active&page=1&limit=20&search=
Response: { users: User[], total: number }

// GET /api/cp/users/[id]
Response: User (with full details, orders, addresses)

// PUT /api/cp/users/[id]
Body: Partial<User>
Response: User

// PUT /api/cp/users/[id]/status
Body: { status: 'active' | 'suspended', reason?: string }
Response: User

// POST /api/cp/users/[id]/reset-password
Body: { newPassword: string }
Response: { success: boolean }

// DELETE /api/cp/users/[id]
Response: { success: boolean }

// GET /api/cp/users/stats
Response: { total: number, active: number, suspended: number, totalSpent: number }
```

---

## MODULE 10: ANALYTICS & REPORTS

### Purpose

View detailed analytics, generate reports, export data

### Layout

```
Analytics Page:
├── Header
│   ├── Title: "Analytics & Reports"
│   ├── Date Range Picker (custom range or presets)
│   │   ├── This Month
│   │   ├── Last 30 Days
│   │   ├── Last Quarter
│   │   ├── This Year
│   │   └── Custom Range
│   └── [Export Report] Button
├── Key Metrics (Cards)
│   ├── Total Revenue (with change %)
│   ├── Total Orders (with change %)
│   ├── Avg Order Value (with change %)
│   ├── Customer Acquisition (with change %)
│   ├── Conversion Rate (with change %)
│   └── Return Rate (with change %)
├── Charts Section
│   ├── Row 1
│   │   ├── Revenue Trend (Line chart)
│   │   └── Orders Trend (Bar chart)
│   ├── Row 2
│   │   ├── Top 10 Products by Revenue (Horizontal bar)
│   │   └── Top 10 Categories by Revenue (Pie/Donut)
│   ├── Row 3
│   │   ├── Payment Method Distribution (Pie)
│   │   └── Order Status Distribution (Pie)
│   └── Row 4
│       ├── Daily Active Users (Line)
│       └── Customer Lifetime Value (Histogram)
├── Detailed Tables
│   ├── Top Products Table
│   ├── Top Categories Table
│   ├── Hourly Sales Table
│   └── Geographic Distribution (if available)
└── Export Options
    ├── [Export CSV]
    ├── [Export PDF]
    └── [Schedule Report]
```

### Report Types

```
1. Sales Report
   - Total revenue
   - Units sold
   - Top products
   - Revenue by category
   - Revenue by payment method
   - Daily/Weekly/Monthly breakdown

2. Customer Report
   - New customers
   - Repeat customer rate
   - Customer lifetime value
   - Geographic distribution
   - Top customers by spending

3. Product Performance
   - Top/bottom products
   - Inventory turnover
   - Stock movement
   - Product by category

4. Operational Report
   - Order processing time
   - Refund rate
   - Return rate
   - Payment success rate
   - Chat response time

5. Marketing Report
   - Promo effectiveness
   - Discount usage
   - Campaign ROI
   - Customer acquisition cost
```

### Database Queries

```sql
-- Revenue by date
SELECT DATE(created_at) as date, SUM(grand_total) as revenue, COUNT(*) as orders
FROM orders
WHERE status IN ('terkirim', 'selesai')
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Top products
SELECT p.id, p.name, SUM(oi.quantity) as units_sold, SUM(oi.quantity * oi.unit_price) as revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id
ORDER BY revenue DESC
LIMIT 10;

-- Customer metrics
SELECT COUNT(DISTINCT user_id) as new_customers FROM users WHERE DATE(created_at) = CURRENT_DATE;
```

### API Endpoints

```typescript
// GET /api/cp/analytics/metrics
Query: ?date_from=&date_to=
Response: { totalRevenue, totalOrders, avgOrderValue, customerAcquisition, ... }

// GET /api/cp/analytics/revenue-trend
Query: ?date_from=&date_to=&interval=daily
Response: { data: Array<{date, revenue}> }

// GET /api/cp/analytics/top-products
Query: ?limit=10&date_from=&date_to=
Response: { products: Array<{name, sold, revenue}> }

// GET /api/cp/analytics/top-categories
Query: ?limit=10&date_from=&date_to=
Response: { categories: Array<{name, sold, revenue}> }

// GET /api/cp/analytics/orders-trend
Query: ?date_from=&date_to=&interval=daily
Response: { data: Array<{date, count}> }

// POST /api/cp/reports/export
Body: { type: 'sales' | 'customer' | 'product' | 'operational', format: 'csv' | 'pdf' }
Response: File download
```

---

## MODULE 11: SETTINGS

### Purpose

Manage store info, integration settings, notification preferences, staff management

### Layout

```
Settings Page:
├── Sidebar (Settings Categories)
│   ├── Store Information
│   ├── Payment Integration
│   ├── Shipping Settings
│   ├── Notification Preferences
│   ├── Staff Management
│   ├── Security
│   └── API Keys
├── Main Content (Dynamic based on category)
└── [Save Changes] Button (appears when edited)
```

### 11A: Store Information

```
├── Store Name
├── Store Logo (upload)
├── Store Description
├── WhatsApp Business Number
├── Business Email
├── Business Phone
├── Business Address
├── Business Hours
│   ├── Monday - Friday
│   ├── Saturday
│   └── Sunday
├── Store URL (CNAME setup)
├── Currency (IDR / etc)
└── Language (ID / EN)
```

### 11B: Payment Integration

```
├── Payment Gateway Selection
│   ├── Midtrans
│   ├── Xendit
│   ├── Stripe (etc)
├── API Key Configuration
│   ├── Merchant ID
│   ├── Client Key
│   ├── Server Key
│   └── [Test Connection] Button
├── Payment Methods Enabled
│   ├── COD Toggle
│   ├── Bank Transfer Toggle
│   ├── E-Wallet Toggle
│   │   ├── GCash
│   ├── PayMaya
│   │   ├── OVO
│   │   └── DANA
│   └── Credit Card Toggle
├── Payment Confirmation
│   ├── Manual confirmation required (toggle)
│   ├── Timeout (hours)
│   └── Auto-cancel unconfirmed (toggle)
└── Webhook Settings (auto-managed)
```

### 11C: Shipping Settings

```
├── Default Shipping Cost (Rp)
├── Free Shipping Threshold (Rp)
├── Processing Time (hours)
├── Shipping Providers
│   ├── JNE (integration)
│   ├── Tiki (integration)
│   ├── Pos Indonesia (integration)
│   └── Custom Courier
├── Address for Pickup
│   ├── Address
│   ├── Coordinates
│   └── Phone Number
└── Return Shipping Handling
    ├── Who pays (buyer/seller)
    └── Max return days
```

### 11D: Notification Preferences

```
├── Email Notifications
│   ├── New Order Toggle
│   ├── Payment Confirmation Toggle
│   ├── Shipment Update Toggle
│   ├── Review Submitted Toggle
│   └── Daily Summary Toggle
├── Push Notifications
│   ├── Enable/Disable
│   ├── Frequency
│   └── Quiet Hours
├── SMS Notifications (optional)
│   ├── Enable/Disable
│   └── Operator Configuration
└── In-App Notifications
    └── Enable/Disable (always default on)
```

### 11E: Staff Management

```
├── Staff List
│   ├── Staff Member Card
│   │   ├── Name
│   │   ├── Email
│   │   ├── Role (admin / moderator / support)
│   │   ├── Status (active/inactive)
│   │   ├── Last Login
│   │   └── Actions (Edit / Remove)
│   └── ... (more staff)
├── [+ Add New Staff] Button
└── Staff Form (modal)
    ├── Name
    ├── Email
    ├── Role Selection
    │   ├── Admin (all permissions)
    │   ├── Moderator (reviews, users)
    │   └── Support (chats, orders view-only)
    └── [Invite] Button (sends email with setup link)
```

### 11F: Security

```
├── Change Admin Password
│   ├── Current Password
│   ├── New Password
│   ├── Confirm Password
│   └── [Change] Button
├── Two-Factor Authentication
│   ├── Enable/Disable Toggle
│   ├── Authenticator App (QR code setup)
│   └── Backup Codes
├── Login History
│   ├── Recent Logins Table
│   │   ├── Date/Time
│   │   ├── IP Address
│   │   ├── Device/Browser
│   │   └── Location
│   └── [Sign Out All] Button
└── Account Recovery
    ├── Recovery Email
    ├── Recovery Phone
    └── [Update] Button
```

### Database Tables

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(30) DEFAULT 'admin', -- 'admin' | 'moderator' | 'support'
  status VARCHAR(20) DEFAULT 'active',
  avatar_url VARCHAR(500),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE store_settings (
  id UUID PRIMARY KEY,
  store_name VARCHAR(255),
  store_description TEXT,
  logo_url VARCHAR(500),
  wa_number VARCHAR(20),
  business_email VARCHAR(100),
  business_phone VARCHAR(20),
  business_address TEXT,
  currency VARCHAR(5) DEFAULT 'IDR',
  language VARCHAR(5) DEFAULT 'id',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payment_settings (
  id UUID PRIMARY KEY,
  gateway_name VARCHAR(50), -- 'midtrans', 'xendit', etc
  merchant_id VARCHAR(100),
  client_key VARCHAR(500),
  server_key VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  cod_enabled BOOLEAN DEFAULT true,
  bank_transfer_enabled BOOLEAN DEFAULT true,
  ewallet_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE admin_roles (
  id UUID PRIMARY KEY,
  admin_id UUID NOT NULL,
  permission_name VARCHAR(100), -- 'view_products', 'edit_products', etc
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,
  UNIQUE(admin_id, permission_name)
);
```

### API Endpoints

```typescript
// GET /api/cp/settings/store
Response: StoreSettings

// PUT /api/cp/settings/store
Body: Partial<StoreSettings>
Response: StoreSettings

// GET /api/cp/settings/payment
Response: PaymentSettings

// PUT /api/cp/settings/payment
Body: Partial<PaymentSettings>
Response: PaymentSettings

// GET /api/cp/settings/shipping
Response: ShippingSettings

// PUT /api/cp/settings/shipping
Body: Partial<ShippingSettings>
Response: ShippingSettings

// GET /api/cp/admin/staff
Response: AdminUser[]

// POST /api/cp/admin/staff
Body: { name, email, role }
Response: { invitationSent: boolean }

// PUT /api/cp/admin/staff/[id]
Body: Partial<AdminUser>
Response: AdminUser

// DELETE /api/cp/admin/staff/[id]
Response: { success: boolean }

// POST /api/cp/admin/change-password
Body: { currentPassword, newPassword }
Response: { success: boolean }
```

---

# 4. Folder & Component Organization

## Folder Structure

```
control-panel/
├── src/
│   ├── app/
│   │   ├── cp/                          # Control panel routes (protected)
│   │   │   ├── page.tsx                 # Redirect to /cp/dashboard
│   │   │   ├── layout.tsx               # CP layout (sidebar + content)
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── StatsCards.tsx
│   │   │   │   │   ├── RevenueChart.tsx
│   │   │   │   │   ├── OrderStatusChart.tsx
│   │   │   │   │   ├── TopProductsTable.tsx
│   │   │   │   │   ├── RecentOrdersWidget.tsx
│   │   │   │   │   └── AnalyticsWidget.tsx
│   │   │   │   └── data.ts              # Mock/query data
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── ProductTable.tsx
│   │   │   │   │   ├── ProductForm.tsx
│   │   │   │   │   ├── VariantForm.tsx
│   │   │   │   │   ├── ImageUpload.tsx
│   │   │   │   │   ├── BulkActions.tsx
│   │   │   │   │   └── ProductFilters.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx         # Product detail/edit
│   │   │   │   └── new/
│   │   │   │       └── page.tsx         # Create product
│   │   │   ├── categories/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── CategoryList.tsx
│   │   │   │   │   ├── CategoryForm.tsx
│   │   │   │   │   └── IconPicker.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── OrdersTable.tsx
│   │   │   │   │   ├── OrderDetail.tsx
│   │   │   │   │   ├── StatusUpdater.tsx
│   │   │   │   │   ├── PaymentConfirm.tsx
│   │   │   │   │   ├── ShipmentForm.tsx
│   │   │   │   │   ├── OrderTimeline.tsx
│   │   │   │   │   ├── OrderFilters.tsx
│   │   │   │   │   └── OrderSearch.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── reviews/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── ReviewsList.tsx
│   │   │   │   │   ├── ReviewCard.tsx
│   │   │   │   │   ├── ReviewDetail.tsx
│   │   │   │   │   ├── ReviewModeration.tsx
│   │   │   │   │   └── ReviewFilters.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── banners/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── BannerList.tsx
│   │   │   │   │   ├── BannerForm.tsx
│   │   │   │   │   ├── BannerDragList.tsx
│   │   │   │   │   └── BannerPreview.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── promotions/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── PromotionList.tsx
│   │   │   │   │   ├── PromotionForm.tsx
│   │   │   │   │   ├── ScopeSelector.tsx
│   │   │   │   │   └── PromotionStats.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── chat/
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/
│   │   │   │       ├── ChatList.tsx
│   │   │   │       ├── ChatDetail.tsx
│   │   │   │       ├── ChatMessage.tsx
│   │   │   │       ├── QuickReplies.tsx
│   │   │   │       └── ChatFilters.tsx
│   │   │   ├── users/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── UsersTable.tsx
│   │   │   │   │   ├── UserDetail.tsx
│   │   │   │   │   ├── UserFilters.tsx
│   │   │   │   │   └── UserActions.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── analytics/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── MetricsCards.tsx
│   │   │   │   │   ├── Charts/
│   │   │   │   │   │   ├── RevenueChart.tsx
│   │   │   │   │   │   ├── OrdersChart.tsx
│   │   │   │   │   │   ├── TopProductsChart.tsx
│   │   │   │   │   │   └── CategoryChart.tsx
│   │   │   │   │   ├── DateRangePicker.tsx
│   │   │   │   │   ├── ReportGenerator.tsx
│   │   │   │   │   └── ExportOptions.tsx
│   │   │   │   └── data.ts
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       ├── components/
│   │   │       │   ├── SettingsSidebar.tsx
│   │   │       │   ├── StoreInfo.tsx
│   │   │       │   ├── PaymentSettings.tsx
│   │   │       │   ├── ShippingSettings.tsx
│   │   │       │   ├── NotificationPrefs.tsx
│   │   │       │   ├── StaffManagement.tsx
│   │   │       │   └── SecuritySettings.tsx
│   │   │       ├── store/
│   │   │       │   └── page.tsx
│   │   │       ├── payment/
│   │   │       │   └── page.tsx
│   │   │       └── [section]/
│   │   │           └── page.tsx
│   │   ├── cp-auth/                     # CP authentication (login/register)
│   │   │   ├── page.tsx                 # Login page
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── ForgotPasswordForm.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   └── api/
│   │       └── cp/                      # Control panel API routes
│   │           ├── products/
│   │           │   ├── route.ts         # GET (list), POST (create)
│   │           │   ├── [id]/
│   │           │   │   ├── route.ts     # GET, PUT, DELETE
│   │           │   │   ├── upload-image/
│   │           │   │   │   └── route.ts
│   │           │   │   └── variants/
│   │           │   │       └── route.ts
│   │           │   └── bulk-export/
│   │           │       └── route.ts
│   │           ├── categories/
│   │           │   ├── route.ts
│   │           │   ├── [id]/
│   │           │   │   └── route.ts
│   │           │   └── reorder/
│   │           │       └── route.ts
│   │           ├── orders/
│   │           │   ├── route.ts
│   │           │   ├── [id]/
│   │           │   │   ├── route.ts
│   │           │   │   ├── status/
│   │           │   │   │   └── route.ts
│   │           │   │   ├── ship/
│   │           │   │   │   └── route.ts
│   │           │   │   ├── refund/
│   │           │   │   │   └── route.ts
│   │           │   │   └── notify/
│   │           │   │       └── route.ts
│   │           │   └── export/
│   │           │       └── route.ts
│   │           ├── reviews/
│   │           │   ├── route.ts
│   │           │   └── [id]/
│   │           │       ├── route.ts
│   │           │       └── status/
│   │           │           └── route.ts
│   │           ├── banners/
│   │           │   ├── route.ts
│   │           │   ├── [id]/
│   │           │   │   └── route.ts
│   │           │   └── reorder/
│   │           │       └── route.ts
│   │           ├── promotions/
│   │           │   ├── route.ts
│   │           │   └── [id]/
│   │           │       └── route.ts
│   │           ├── chat/
│   │           │   ├── route.ts
│   │           │   └── [roomId]/
│   │           │       ├── route.ts
│   │           │       ├── messages/
│   │           │       │   └── route.ts
│   │           │       └── status/
│   │           │           └── route.ts
│   │           ├── users/
│   │           │   ├── route.ts
│   │           │   └── [id]/
│   │           │       └── route.ts
│   │           ├── analytics/
│   │           │   ├── metrics/
│   │           │   │   └── route.ts
│   │           │   ├── revenue-trend/
│   │           │   │   └── route.ts
│   │           │   └── export-report/
│   │           │       └── route.ts
│   │           ├── settings/
│   │           │   ├── store/
│   │           │   │   └── route.ts
│   │           │   ├── payment/
│   │           │   │   └── route.ts
│   │           │   └── staff/
│   │           │       └── route.ts
│   │           ├── auth/
│   │           │   ├── login/
│   │           │   │   └── route.ts
│   │           │   ├── logout/
│   │           │   │   └── route.ts
│   │           │   └── verify-token/
│   │           │       └── route.ts
│   │           └── health/
│   │               └── route.ts
│   ├── components/
│   │   ├── cp/                          # CP-specific components (reusable)
│   │   │   ├── Layout/
│   │   │   │   ├── CPLayout.tsx         # Main layout wrapper
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── TopBar.tsx
│   │   │   │   └── Breadcrumb.tsx
│   │   │   ├── Common/
│   │   │   │   ├── PageHeader.tsx
│   │   │   │   ├── ActionButton.tsx
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── FilterDropdown.tsx
│   │   │   │   ├── SortDropdown.tsx
│   │   │   │   ├── PaginationControl.tsx
│   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── EmptyState.tsx
│   │   │   ├── Forms/
│   │   │   │   ├── FormField.tsx
│   │   │   │   ├── FormGroup.tsx
│   │   │   │   ├── DatePicker.tsx
│   │   │   │   ├── MultiSelect.tsx
│   │   │   │   ├── ImageUploadField.tsx
│   │   │   │   ├── RichTextEditor.tsx
│   │   │   │   └── CropImageModal.tsx
│   │   │   ├── Tables/
│   │   │   │   ├── DataTable.tsx        # Reusable table with sorting/pagination
│   │   │   │   ├── TableActionsMenu.tsx
│   │   │   │   └── BulkActionsBar.tsx
│   │   │   ├── Charts/
│   │   │   │   ├── BarChart.tsx
│   │   │   │   ├── LineChart.tsx
│   │   │   │   ├── PieChart.tsx
│   │   │   │   └── ChartCard.tsx
│   │   │   └── Modals/
│   │   │       ├── BaseModal.tsx
│   │   │       ├── ConfirmModal.tsx
│   │   │       └── PreviewModal.tsx
│   │   └── shared/
│   │       └── (App-wide shared components)
│   ├── lib/
│   │   ├── cp/
│   │   │   ├── api-client.ts            # Fetch wrapper for CP API
│   │   │   ├── validators.ts            # Form validation rules
│   │   │   ├── formatters.ts            # Format dates, numbers, currency
│   │   │   ├── constants.ts             # CP constants (table columns, routes, etc)
│   │   │   └── types.ts                 # TypeScript interfaces
│   │   ├── utils.ts
│   │   └── types.ts
│   ├── store/
│   │   ├── cp/
│   │   │   ├── useAuthStore.ts          # CP auth (admin login)
│   │   │   ├── useProductStore.ts       # Product management state
│   │   │   ├── useOrderStore.ts
│   │   │   ├── useCategoryStore.ts
│   │   │   ├── useUiStore.ts            # UI state (sidebar, modals)
│   │   │   └── useFilterStore.ts        # Filter/sort state
│   │   └── (shared stores)
│   ├── hooks/
│   │   ├── cp/
│   │   │   ├── useProducts.ts           # Product CRUD hooks
│   │   │   ├── useOrders.ts
│   │   │   ├── useCategories.ts
│   │   │   ├── useFetch.ts              # Generic fetch with loading/error
│   │   │   └── usePagination.ts
│   │   └── (shared hooks)
│   ├── middleware/
│   │   ├── auth.ts                      # CP auth middleware
│   │   └── logger.ts
│   └── styles/
│       └── cp.css                       # CP-specific styles (if needed)
├── public/
│   ├── icons/
│   │   └── (category icons, etc)
│   └── images/
├── prisma/ (if using Prisma ORM)
│   └── schema.prisma
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

---

# 5. Database Schema Design

## Core Tables

```sql
-- Admin Users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) DEFAULT 'admin',
  status VARCHAR(20) DEFAULT 'active',
  avatar_url VARCHAR(500),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  color_theme VARCHAR(7),
  description TEXT,
  sort_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  description TEXT,
  cost_price DECIMAL(12,2),
  selling_price DECIMAL(12,2) NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  stock INT DEFAULT 0,
  low_stock_warning INT DEFAULT 10,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  sold_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_category (category_id),
  INDEX idx_sku (sku),
  INDEX idx_active (is_active)
);

-- Product Variants
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  stock INT DEFAULT 0,
  price_modifier DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, name)
);

-- Product Images
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  is_main BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  status VARCHAR(30) DEFAULT 'menunggu_bayar',
  payment_method VARCHAR(30),
  payment_status VARCHAR(20) DEFAULT 'pending',
  total_amount DECIMAL(12,2) NOT NULL,
  shipping_cost DECIMAL(10,2),
  discount_amount DECIMAL(10,2) DEFAULT 0,
  grand_total DECIMAL(12,2) NOT NULL,
  delivery_name VARCHAR(100),
  delivery_phone VARCHAR(20),
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_status (status),
  INDEX idx_date (created_at),
  INDEX idx_payment_status (payment_status)
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  user_id UUID NOT NULL,
  order_id UUID REFERENCES orders(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT NOT NULL,
  images_urls TEXT[],
  likes INT DEFAULT 0,
  dislikes INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  rejection_reason VARCHAR(100),
  is_verified_purchase BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES admin_users(id),
  INDEX idx_status (status),
  INDEX idx_product (product_id)
);

-- Banners
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  link_type VARCHAR(30),
  link_target VARCHAR(500),
  sort_order INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  scheduled_start TIMESTAMP,
  scheduled_end TIMESTAMP,
  is_scheduled BOOLEAN DEFAULT false,
  click_count INT DEFAULT 0,
  impression_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Promotions
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20),
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2),
  max_discount_cap DECIMAL(10,2),
  scope_type VARCHAR(30),
  scope_ids TEXT[],
  max_uses INT,
  max_uses_per_user INT DEFAULT 1,
  current_uses INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  is_scheduled BOOLEAN DEFAULT false,
  scheduled_start TIMESTAMP,
  scheduled_end TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_code (code),
  INDEX idx_status (status)
);

-- Chat Rooms
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  admin_id UUID REFERENCES admin_users(id),
  room_type VARCHAR(30),
  context_id UUID,
  status VARCHAR(20) DEFAULT 'open',
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_status (status)
);

-- Chat Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_type VARCHAR(20),
  sender_id UUID,
  message_type VARCHAR(20),
  content TEXT,
  media_url VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_room (room_id)
);

-- Store Settings
CREATE TABLE store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name VARCHAR(255),
  store_description TEXT,
  logo_url VARCHAR(500),
  wa_number VARCHAR(20),
  business_email VARCHAR(100),
  business_phone VARCHAR(20),
  business_address TEXT,
  currency VARCHAR(5) DEFAULT 'IDR',
  language VARCHAR(5) DEFAULT 'id',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment Settings
CREATE TABLE payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name VARCHAR(50),
  merchant_id VARCHAR(100),
  client_key VARCHAR(500),
  server_key VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  cod_enabled BOOLEAN DEFAULT true,
  bank_transfer_enabled BOOLEAN DEFAULT true,
  ewallet_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

# 6. API Endpoints Structure

## Naming Convention

```
/api/cp/[module]/[resource]/[action]

Examples:
GET    /api/cp/products                    # List products
POST   /api/cp/products                    # Create product
GET    /api/cp/products/123                # Get product detail
PUT    /api/cp/products/123                # Update product
DELETE /api/cp/products/123                # Delete product
POST   /api/cp/products/123/upload-image   # Upload image
POST   /api/cp/products/bulk-export        # Bulk export

GET    /api/cp/orders                      # List orders
PUT    /api/cp/orders/123/status          # Update order status
POST   /api/cp/orders/123/ship            # Ship order
POST   /api/cp/orders/123/refund          # Process refund
```

## Request/Response Format

```typescript
// Standard Success Response
{
  success: true,
  data: { /* ... */ },
  message: "Operation successful"
}

// Standard Error Response
{
  success: false,
  error: {
    code: "PRODUCT_NOT_FOUND",
    message: "Product with ID xxx not found",
    details: { /* ... */ }
  }
}

// Paginated Response
{
  success: true,
  data: {
    items: [ /* ... */ ],
    pagination: {
      page: 1,
      limit: 20,
      total: 150,
      pages: 8
    }
  }
}
```

## Authentication

```
Every request to /api/cp/* must include:

Header: Authorization: Bearer <jwt_token>

JWT Token contains:
- admin_id
- role
- permissions
- iat (issued at)
- exp (expiration: 24 hours recommended)

On auth failure:
Response: 401 Unauthorized
Body: { error: { code: "AUTH_REQUIRED", message: "..." } }
```

---

# 7. State Management Strategy

## Zustand Stores for Control Panel

```typescript
// Auth Store (useAuthStore.ts)
interface AuthState {
  admin: Admin | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email, password) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// Product Store (useProductStore.ts)
interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProducts: (filters?) => Promise<void>;
  fetchProduct: (id) => Promise<void>;
  createProduct: (data) => Promise<void>;
  updateProduct: (id, data) => Promise<void>;
  deleteProduct: (id) => Promise<void>;
  bulkDelete: (ids) => Promise<void>;
}

// UI Store (useUiStore.ts)
interface UIState {
  sidebarOpen: boolean;
  currentPage: string;
  modals: {
    product: boolean;
    category: boolean;
    order: boolean;
    // ... other modals
  };
  toggleSidebar: () => void;
  openModal: (type) => void;
  closeModal: (type) => void;
  setCurrentPage: (page) => void;
}

// Filter Store (useFilterStore.ts)
interface FilterState {
  filters: {
    search: string;
    category: string;
    status: string;
    dateFrom: Date | null;
    dateTo: Date | null;
    // ... other filters
  };
  sortBy: string;
  page: number;
  limit: number;

  // Actions
  setFilter: (key, value) => void;
  setSortBy: (key) => void;
  setPage: (page) => void;
  resetFilters: () => void;
}
```

---

# 8. Development Roadmap (Phased Approach)

## Phase 1: Foundation (Week 1-2)

### Setup & Infrastructure

- [ ] Next.js project setup with TypeScript
- [ ] Database schema creation (PostgreSQL)
- [ ] Authentication system (JWT)
- [ ] Middleware & error handling

### Components

- [ ] CP Layout (Sidebar + Top Bar)
- [ ] Login page
- [ ] Dashboard shell (with stats cards)
- [ ] Reusable table component
- [ ] Reusable form components
- [ ] Modal wrapper

### Core Features

- [ ] Admin login/logout
- [ ] Dashboard (basic stats only)
- [ ] Protected routes

---

## Phase 2: Core CRUD (Week 3-4)

### Product Management (Full CRUD)

- [ ] Product list with pagination/filtering
- [ ] Create product modal/page
- [ ] Edit product page
- [ ] Delete product with confirmation
- [ ] Image upload & crop
- [ ] Variant management
- [ ] Bulk export

### Category Management

- [ ] Category list (drag-reorder)
- [ ] Create/edit category
- [ ] Delete category
- [ ] Icon picker

### Basic Orders View

- [ ] Orders list with status filter
- [ ] Order detail view
- [ ] Order status update

---

## Phase 3: Advanced Features (Week 5-6)

### Orders Management Complete

- [ ] Payment confirmation flow
- [ ] Shipment form & tracking
- [ ] Refund processing
- [ ] Order timeline
- [ ] Customer notification

### Reviews Moderation

- [ ] Reviews list (pending/approved/rejected)
- [ ] Review detail & moderation
- [ ] Approve/reject/delete reviews

### Banners Management

- [ ] Banner list with drag-reorder
- [ ] Banner form & image upload
- [ ] Schedule configuration
- [ ] Analytics view

### Promotions Management

- [ ] Promo list & filtering
- [ ] Create/edit promotion
- [ ] Scope configuration
- [ ] Usage tracking

---

## Phase 4: Support & Management (Week 7-8)

### Chat Management

- [ ] Chat room list
- [ ] Chat detail view
- [ ] Send message
- [ ] Quick replies
- [ ] Room status update

### User Management

- [ ] Users list & search
- [ ] User detail page
- [ ] Suspend/activate user
- [ ] User activity log

### Analytics & Reports

- [ ] Dashboard charts (revenue, orders)
- [ ] Detailed analytics page
- [ ] Report generation
- [ ] CSV/PDF export

### Settings

- [ ] Store information settings
- [ ] Payment gateway config
- [ ] Shipping settings
- [ ] Staff management
- [ ] Security settings

---

## Phase 5: Polish & Optimization (Week 9-10)

### UI/UX Improvements

- [ ] Loading states & skeletons
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Responsive design (mobile support)
- [ ] Accessibility audit

### Performance

- [ ] API response caching
- [ ] Image optimization
- [ ] Code splitting
- [ ] Database indexing optimization

### Testing & QA

- [ ] Unit tests for critical functions
- [ ] Integration tests for API
- [ ] E2E testing (Cypress/Playwright)
- [ ] Bug fixes & improvements

### Documentation

- [ ] API documentation
- [ ] Component storybook
- [ ] Deployment guide
- [ ] Admin user manual

---

## Implementation Priority

### Must-Have (MVP)

1. Authentication
2. Product CRUD
3. Orders management
4. Dashboard

### Should-Have

1. Reviews moderation
2. Banners management
3. Basic analytics
4. Chat management

### Nice-to-Have

1. Advanced analytics
2. Promotions (full featured)
3. Multi-staff support
4. Inventory tracking detailed

---

**End of Control Panel Implementation Plan**

---

## Next Steps

1. **Review & Validate**
   - Share this plan with stakeholders
   - Adjust based on feedback
   - Finalize tech stack & tools

2. **Setup Project**
   - Initialize Next.js + TypeScript
   - Setup PostgreSQL
   - Configure environment variables
   - Setup CI/CD pipeline

3. **Begin Phase 1**
   - Create folder structure
   - Implement authentication
   - Build CP layout components
   - Create dashboard shell

---

**Document Status:** Ready for Development  
**Last Updated:** May 19, 2026  
**Version:** 1.0
