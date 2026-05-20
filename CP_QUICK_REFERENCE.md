# Control Panel Quick Reference Guide

## 📌 Quick Links

| Module         | Route            | Main Table       | API Base             |
| -------------- | ---------------- | ---------------- | -------------------- |
| **Dashboard**  | `/cp/dashboard`  | -                | -                    |
| **Products**   | `/cp/products`   | `products`       | `/api/cp/products`   |
| **Categories** | `/cp/categories` | `categories`     | `/api/cp/categories` |
| **Orders**     | `/cp/orders`     | `orders`         | `/api/cp/orders`     |
| **Reviews**    | `/cp/reviews`    | `reviews`        | `/api/cp/reviews`    |
| **Banners**    | `/cp/banners`    | `banners`        | `/api/cp/banners`    |
| **Promotions** | `/cp/promotions` | `promotions`     | `/api/cp/promotions` |
| **Chat**       | `/cp/chat`       | `chat_rooms`     | `/api/cp/chat`       |
| **Users**      | `/cp/users`      | `users`          | `/api/cp/users`      |
| **Analytics**  | `/cp/analytics`  | -                | `/api/cp/analytics`  |
| **Settings**   | `/cp/settings`   | `store_settings` | `/api/cp/settings`   |

---

## 🔐 Sidebar Navigation (11 Items)

```
ATHERIS CONTROL PANEL
├── 🏠 Dashboard           /cp/dashboard
├── 📦 Products           /cp/products
├── 🏷️  Categories         /cp/categories
├── 📋 Orders             /cp/orders
├── ⭐ Reviews            /cp/reviews
├── 🎪 Banners            /cp/banners
├── 🎁 Promotions         /cp/promotions
├── 💬 Chat              /cp/chat
├── 👥 Users             /cp/users
├── 📊 Analytics          /cp/analytics
└── ⚙️  Settings          /cp/settings
```

---

## 📦 Product Management

### Key Operations

```
GET    /api/cp/products                 # List with filters
POST   /api/cp/products                 # Create
GET    /api/cp/products/[id]            # Detail
PUT    /api/cp/products/[id]            # Update
DELETE /api/cp/products/[id]            # Delete
POST   /api/cp/products/[id]/upload-image
POST   /api/cp/products/bulk-delete
POST   /api/cp/products/bulk-export
```

### Form Tabs

1. **Basic Info** - Name, SKU, Category, Description, Status
2. **Pricing** - Cost Price, Selling Price, Discount, Margin
3. **Stock** - Total Stock, Low Stock Warning, History Log
4. **Variants** - Add/Edit/Delete variants with per-variant stock
5. **Images** - Upload max 3 images, crop, reorder
6. **SEO** (optional) - Meta title, description, keywords

### Key Fields

- `sku`: Unique product identifier
- `selling_price`: Main price
- `discount_percentage`: 0-100%
- `stock`: Total stock across all variants
- `variants`: Array of {name, stock, price_modifier}
- `images`: Array of {url, is_main, sort_order}

---

## 📋 Orders Management

### Order Status Flow (8 Statuses)

```
Menunggu Bayar → Pembayaran Verifikasi → Pesanan Dikonfirmasi
→ Sedang Dikemas → Siap Dikirim → Dalam Pengiriman
→ Terkirim → Selesai
```

### Quick Status Updates

```
PUT /api/cp/orders/[id]/status
Body: { status: "string", notes?: "string" }

POST /api/cp/orders/[id]/confirm-payment
POST /api/cp/orders/[id]/ship
POST /api/cp/orders/[id]/refund
POST /api/cp/orders/[id]/cancel
```

### Order Components

- **Order Summary**: Items, total, shipping, grand total
- **Payment**: Method, status, proof image, confirm button
- **Shipping**: Courier, tracking, estimated delivery
- **Timeline**: Status history with timestamps
- **Customer Info**: Name, email, phone, address
- **Chat Button**: Direct link to customer chat

---

## ⭐ Reviews Moderation

### Filter Tabs

- **All** - All reviews
- **Pending** - Need approval
- **Approved** - Published reviews
- **Rejected** - Rejected reviews

### Moderation Actions

```
GET    /api/cp/reviews?status=pending
PUT    /api/cp/reviews/[id]/status
Body: {
  status: 'approved' | 'rejected',
  reason?: 'spam' | 'inappropriate' | 'offensive' | 'not_relevant',
  notes?: 'string'
}
DELETE /api/cp/reviews/[id]
```

### Review Fields

- `rating`: 1-5 stars
- `comment`: Text review
- `images_urls`: Array of review images
- `is_verified_purchase`: Boolean
- `likes`: Helpful vote count
- `status`: pending/approved/rejected

---

## 🎪 Banners Management

### Operations

```
GET    /api/cp/banners                  # List (drag-reorderable)
POST   /api/cp/banners                  # Create with image
PUT    /api/cp/banners/[id]             # Update
DELETE /api/cp/banners/[id]             # Delete
PUT    /api/cp/banners/reorder          # Drag-reorder
GET    /api/cp/banners/[id]/analytics   # Click/impression stats
```

### Banner Configuration

- **Image**: Upload & crop (recommended: 1080x600px)
- **Link**: URL, Product, Category, or None
- **Schedule**: Start date/time, end date/time
- **Status**: Active/Inactive/Scheduled
- **Analytics**: Click count, impressions, CTR

---

## 🎁 Promotions Management

### Promo Types

1. **Percentage** - e.g., 20% discount
2. **Fixed Amount** - e.g., Rp 50.000 off
3. **Buy-Get** - e.g., Buy 2 Get 1 Free

### Scope Options

- All Products
- Specific Categories (multi-select)
- Specific Products (multi-select)
- Specific Users (optional)

### Promo Endpoints

```
GET    /api/cp/promotions              # List active/scheduled
POST   /api/cp/promotions              # Create
PUT    /api/cp/promotions/[id]         # Update
DELETE /api/cp/promotions/[id]         # Delete
GET    /api/cp/promotions/[id]/usage   # Track usage
```

### Key Fields

- `code`: Unique promo code (optional, auto-generate)
- `discount_type`: percentage | fixed | buy_get
- `discount_value`: 10 or 50000
- `min_purchase`: Minimum purchase amount
- `max_uses`: Total uses allowed
- `max_uses_per_user`: Per user limit
- `status`: active | inactive | scheduled

---

## 💬 Chat Management

### Chat Rooms

```
GET    /api/cp/chats                    # List rooms
GET    /api/cp/chats/[roomId]           # Room detail
GET    /api/cp/chats/[roomId]/messages  # Message history
POST   /api/cp/chats/[roomId]/messages  # Send message
PUT    /api/cp/chats/[roomId]/status    # Update room status
POST   /api/cp/chats/[roomId]/assign    # Assign to staff
```

### Room Status

- **open** - Active conversation
- **waiting** - Waiting for admin response
- **resolved** - Conversation ended

### Quick Replies

```
GET    /api/cp/quick-replies            # List templates
POST   /api/cp/quick-replies            # Create template
```

---

## 👥 User Management

### User Actions

```
GET    /api/cp/users                    # List with filters
GET    /api/cp/users/[id]               # User detail
PUT    /api/cp/users/[id]               # Update
PUT    /api/cp/users/[id]/status        # Suspend/activate
POST   /api/cp/users/[id]/reset-password
DELETE /api/cp/users/[id]               # Delete account
```

### User Statuses

- **active** - Normal user
- **suspended** - Banned from purchases
- **unverified** - Email not verified

### User Info

- Username, Email, Phone
- Registration date, last login
- Total orders, total spent
- Account completion percentage
- Addresses (max 3)

---

## 📊 Analytics & Reports

### Available Metrics

```
GET /api/cp/analytics/metrics
Returns: {
  totalRevenue,
  totalOrders,
  avgOrderValue,
  customerAcquisition,
  conversionRate,
  returnRate
}
```

### Report Types

1. **Sales Report** - Revenue, units, top products
2. **Customer Report** - New customers, LTV, retention
3. **Product Report** - Top/bottom products, turnover
4. **Operational Report** - Processing time, refund rate, chat response
5. **Marketing Report** - Promo effectiveness, CAC, ROI

### Export Formats

```
POST /api/cp/reports/export
Body: {
  type: 'sales' | 'customer' | 'product' | 'operational',
  format: 'csv' | 'pdf',
  date_from?: date,
  date_to?: date
}
```

---

## ⚙️ Settings Sections

### 1. Store Information

- Store name, logo, description
- WhatsApp number, email, phone
- Business address, hours
- Currency, language

### 2. Payment Integration

- Gateway selection (Midtrans, Xendit, Stripe)
- API key configuration
- Payment methods enabled (COD, Bank, E-wallet)
- Webhook configuration

### 3. Shipping Settings

- Default shipping cost
- Free shipping threshold
- Processing time
- Shipping providers
- Pickup address

### 4. Notification Preferences

- Email notifications (toggle)
- Push notifications (toggle)
- SMS notifications (toggle)
- Quiet hours configuration

### 5. Staff Management

- Add/remove staff members
- Role assignment (admin, moderator, support)
- Permission management
- Activity logging

### 6. Security

- Change password
- Two-factor authentication
- Login history
- Recovery options

---

## 🗄️ Database Tables Overview

### Core Tables (15 Total)

```
admin_users          - Admin account management
users               - Customer accounts
categories          - Product categories
products            - Product catalog
product_variants    - Product variants & options
product_images      - Product photos
orders              - Customer orders
order_items         - Order line items
order_payments      - Payment records
order_shipments     - Shipping info
reviews             - Product reviews
banners             - Homepage banners
promotions          - Discount campaigns
chat_rooms          - Support chat rooms
chat_messages       - Chat messages
store_settings      - Store configuration
payment_settings    - Payment gateway config
```

---

## 🔌 Component Reusability

### Layout Components

```
CPLayout          - Main wrapper
Sidebar           - Navigation menu
TopBar            - Header with profile
Breadcrumb        - Navigation path
```

### Common Components

```
PageHeader        - Title + actions
DataTable         - Sortable, paginated table
SearchBar         - Search input
FilterDropdown    - Multi-filter selector
SortDropdown      - Sort options
PaginationControl - Page navigation
ConfirmDialog     - Delete confirmation
Modal             - Generic modal wrapper
```

### Form Components

```
FormField         - Input with label & validation
FormGroup         - Group of fields
DatePicker        - Date selection
MultiSelect       - Multi-select dropdown
ImageUploadField  - Drag & drop image upload
CropImageModal    - Image cropping tool
RichTextEditor    - WYSIWYG editor
```

### Chart Components

```
LineChart         - Trend charts
BarChart          - Comparison charts
PieChart          - Proportion charts
ChartCard         - Card wrapper for charts
```

---

## 🎯 Priority Matrix

### Phase 1 (MVP - Weeks 1-4)

**Must-Have:**

- ✅ Authentication & Login
- ✅ Dashboard (basic)
- ✅ Product CRUD
- ✅ Category management
- ✅ Orders list + detail
- ✅ Basic analytics

### Phase 2 (Advanced - Weeks 5-8)

**Should-Have:**

- ✅ Orders complete workflow
- ✅ Reviews moderation
- ✅ Banners management
- ✅ Chat management
- ✅ User management
- ✅ Promotions

### Phase 3 (Optimization - Weeks 9-10)

**Nice-to-Have:**

- ✅ Advanced analytics & reports
- ✅ Settings (payment, shipping, staff)
- ✅ Performance optimization
- ✅ Testing & QA
- ✅ Documentation

---

## 📝 Common API Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product with ID xxx not found",
    "details": {}
  }
}
```

### Pagination Query

```
GET /api/cp/products?page=1&limit=20&sort=name&category=snack&status=active
```

---

## 🚀 Getting Started Checklist

- [ ] Setup Next.js 14 + TypeScript
- [ ] Configure PostgreSQL database
- [ ] Create folder structure
- [ ] Setup authentication (JWT)
- [ ] Create migration files (SQL)
- [ ] Implement CPLayout component
- [ ] Create Sidebar navigation
- [ ] Setup Zustand stores
- [ ] Create API client wrapper
- [ ] Build reusable form components
- [ ] Build reusable table component
- [ ] Implement login page
- [ ] Create dashboard shell
- [ ] Start Phase 1 modules

---

**Quick Reference Version:** 1.0  
**Last Updated:** May 19, 2026  
**For:** Atheris Control Panel Development
