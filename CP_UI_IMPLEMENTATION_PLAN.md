# Control Panel — UI & Page Implementation Plan

**Target:** Page-by-page UI specifications for Atheris Control Panel  
**Purpose:** Visual reference for building each page/module  
**Status:** Detailed Design Document  
**Last Updated:** May 19, 2026

---

## 📋 Pages Index

| #   | Module              | Route               | Priority | Est. Dev Days |
| --- | ------------------- | ------------------- | -------- | ------------- |
| 1   | Authentication      | `/cp-auth`          | **P0**   | 2             |
| 2   | Dashboard           | `/cp/dashboard`     | **P0**   | 3             |
| 3   | Products List       | `/cp/products`      | **P0**   | 3             |
| 4   | Product Create/Edit | `/cp/products/[id]` | **P0**   | 4             |
| 5   | Categories          | `/cp/categories`    | **P1**   | 2             |
| 6   | Orders List         | `/cp/orders`        | **P0**   | 3             |
| 7   | Order Detail        | `/cp/orders/[id]`   | **P0**   | 4             |
| 8   | Reviews             | `/cp/reviews`       | **P1**   | 2             |
| 9   | Banners             | `/cp/banners`       | **P1**   | 3             |
| 10  | Promotions          | `/cp/promotions`    | **P1**   | 3             |
| 11  | Chat                | `/cp/chat`          | **P2**   | 3             |
| 12  | Users               | `/cp/users`         | **P2**   | 2             |
| 13  | Analytics           | `/cp/analytics`     | **P2**   | 4             |
| 14  | Settings            | `/cp/settings`      | **P2**   | 3             |

**Total Pages:** 14 main pages  
**Total Estimated Dev Time:** ~40 days (working days)

---

## 🎨 Design System

### Color Palette

```
Primary:     #2563EB (Blue)
Secondary:   #7C3AED (Purple)
Success:     #16A34A (Green)
Warning:     #EA580C (Orange)
Danger:      #DC2626 (Red)
Info:        #0284C7 (Light Blue)

Background: #F8FAFC (Light Gray)
Border:     #E2E8F0 (Border Gray)
Text:       #1E293B (Dark Text)
Muted:      #64748B (Gray Text)
```

### Typography

```
Headings:   Inter/Poppins, Bold (600-700)
Body:       Inter, Regular (400)
Mono:       Courier New, Regular (for code)

H1: 32px, 600 font-weight
H2: 24px, 600 font-weight
H3: 20px, 600 font-weight
Body: 14px, 400 font-weight
Small: 12px, 400 font-weight
```

### Spacing

```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
```

### Border Radius

```
sm: 4px
md: 8px
lg: 12px
full: 9999px
```

---

# PAGE 1: Authentication (Login)

## Route

`/cp-auth` → Login Page

## Purpose

Single admin login for control panel

## Layout

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         ┌──────────────────┐        │
│         │  ATHERIS ADMIN   │        │
│         │    LOGIN PANEL   │        │
│         ├──────────────────┤        │
│         │                  │        │
│         │ Email Input      │        │
│         │                  │        │
│         │ Password Input   │        │
│         │                  │        │
│         │ [Login Button]   │        │
│         │                  │        │
│         │ Forgot Password? │        │
│         │                  │        │
│         └──────────────────┘        │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

## Component Breakdown

```
LoginPage
├── Background (gradient or image)
├── LoginCard (white container)
│   ├── Logo/Branding
│   ├── Title: "Control Panel Login"
│   ├── LoginForm
│   │   ├── EmailInput
│   │   ├── PasswordInput
│   │   ├── [Login Button]
│   │   ├── "Remember me" Checkbox
│   │   └── "Forgot Password?" Link
│   └── Footer text
└── Toast (for errors)
```

## Form Fields

```typescript
Form: LoginForm
├── email: string (required, email validation)
├── password: string (required, min 6 chars)
└── rememberMe: boolean (optional)

State:
├── isLoading: boolean
├── error?: string
└── successMessage?: string
```

## Validation Rules

```
Email:
- Required: "Email wajib diisi"
- Format: "Email format tidak valid"
- Exists: "Email tidak terdaftar"

Password:
- Required: "Password wajib diisi"
- Min 6 chars: "Password minimal 6 karakter"
- Invalid: "Email atau password salah"
```

## API Calls

```typescript
POST /api/cp/auth/login
Body: { email: string, password: string, rememberMe?: boolean }
Response: {
  token: string,
  admin: { id, name, email, role },
  message: string
}
Error: { error: string, code: string }
```

## UI Specifications

- **Card Width:** 400px (mobile: 95vw, tablet: 450px)
- **Input Height:** 44px
- **Button Height:** 44px
- **Border Radius:** 8px
- **Box Shadow:** `0 4px 12px rgba(0,0,0,0.1)`
- **Loading State:** Button becomes disabled, spinner shows
- **Error State:** Red border on input, error message below field
- **Success Redirect:** After login success, redirect to `/cp/dashboard`

---

# PAGE 2: Dashboard

## Route

`/cp/dashboard`

## Purpose

Overview of key metrics, charts, and recent activity

## Full Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  DASHBOARD                          [Date Range Picker]     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│  │ Revenue    │ │ Orders     │ │ Products   │ │ Users    │ │
│  │ Rp 50.0M   │ │ 245        │ │ 125        │ │ 1.2K     │ │
│  │ +12%       │ │ +8%        │ │ +2%        │ │ +5%      │ │
│  └────────────┘ └────────────┘ └────────────┘ └──────────┘ │
│                                                              │
│  ┌────────────────────────────┐  ┌────────────────────────┐ │
│  │ Sales Revenue (30 days)    │  │ Order Status Dist.     │ │
│  │ [LINE CHART]               │  │ [PIE CHART]            │ │
│  │                            │  │                        │ │
│  └────────────────────────────┘  └────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────┐  ┌────────────────────────┐ │
│  │ Top 5 Products by Revenue  │  │ Top 5 Categories       │ │
│  │ [BAR CHART]                │  │ [HORIZONTAL BAR]       │ │
│  │                            │  │                        │ │
│  └────────────────────────────┘  └────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Recent Orders                                          │ │
│  │ [TABLE]                                                │ │
│  │ Order ID | Customer | Total | Status | Date           │ │
│  │ ...                                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Last Updated: Just now                                      │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

```
DashboardPage
├── Header
│   ├── PageTitle: "Dashboard"
│   └── DateRangePicker (dropdown: This Month / 30 days / Custom)
├── StatsCards (4 cards in grid)
│   ├── StatsCard (Revenue)
│   ├── StatsCard (Orders)
│   ├── StatsCard (Products)
│   └── StatsCard (Users)
├── ChartsRow1 (2 columns)
│   ├── RevenueChart (Line)
│   └── OrderStatusChart (Pie)
├── ChartsRow2 (2 columns)
│   ├── TopProductsChart (Bar)
│   └── TopCategoriesChart (Horizontal Bar)
├── RecentOrdersWidget (Table with 5-10 rows)
├── RecentReviewsWidget (List with 5 items)
└── Footer (Last Updated)
```

## Data Structure

```typescript
interface DashboardStats {
  revenue: {
    value: number;
    change: number;
    changePercent: number;
  };
  orders: {
    value: number;
    change: number;
    changePercent: number;
  };
  products: {
    value: number;
    change: number;
    changePercent: number;
  };
  users: {
    value: number;
    change: number;
    changePercent: number;
  };
}

interface RevenueData {
  date: string;
  revenue: number;
}

interface OrderStatus {
  status: string;
  count: number;
}
```

## Grid Layout

```
// Desktop (1200px+)
├── Row 1: 4 columns (Stats)
├── Row 2: 2 columns (Charts)
│   ├── Col 1: Revenue Chart
│   └── Col 2: Order Status Chart
├── Row 3: 2 columns (Charts)
│   ├── Col 1: Top Products
│   └── Col 2: Top Categories
└── Row 4: 1 column (Recent Orders)

// Tablet (768px - 1199px)
├── Row 1: 2 columns (Stats)
├── Row 2: 2 columns (Stats)
├── Row 3: 1 column (Revenue Chart)
├── Row 4: 1 column (Order Status)
└── ...

// Mobile (< 768px)
├── All full width (1 column)
```

## Chart Specifications

### Sales Revenue Chart

- **Type:** Line Chart
- **Library:** Recharts / Chart.js
- **Data:** Last 30 days of daily revenue
- **X-Axis:** Dates
- **Y-Axis:** Currency (Rp)
- **Colors:** Blue gradient
- **Tooltip:** Shows date & amount
- **Interactive:** Hover to see details

### Order Status Distribution

- **Type:** Pie/Donut Chart
- **Data:** Count of orders by status
- **Colors:** Different color per status
- **Legend:** Show status names
- **Center Label:** Total orders (if Donut)

### Top Products Chart

- **Type:** Horizontal Bar Chart
- **Data:** Top 5-10 products by revenue
- **Colors:** Single color with gradient
- **Labels:** Product name, revenue amount

---

# PAGE 3: Products List

## Route

`/cp/products`

## Purpose

View all products, search, filter, bulk actions

## Full Page Layout

```
┌────────────────────────────────────────────────────────────┐
│ PRODUK KATALOG                          [+ Add New Product] │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ [Search by name/SKU] [Category ▼] [Status ▼] [Stock ▼]   │
│                                                             │
│ ☐ Select All  [Bulk Edit ▼] [Bulk Delete] [Export CSV]   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ ☐ │ │ │ Name │ SKU │ Category │ Price │ Stock │ Status ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ ☐ │ 📷 │ Tahu │ SKU-001 │ Tahu │ Rp 25K │ 150 │ ✓ Active ││
│ │ ☐ │ 📷 │ ... │                                         ││
│ │ ☐ │ 📷 │ ... │                                         ││
│ │ ☐ │ 📷 │ ... │                                         ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Showing 1-20 of 125 products   [< 1 2 3 >] Show: 20 ▼    │
└────────────────────────────────────────────────────────────┘
```

## Component Breakdown

```
ProductsPage
├── Header
│   ├── PageTitle: "Produk Katalog"
│   └── [+ Add New Product] Button
├── SearchAndFilters
│   ├── SearchInput (placeholder: "Cari nama atau SKU")
│   ├── CategoryFilter Dropdown
│   ├── StatusFilter Dropdown
│   └── StockFilter Dropdown (In Stock, Low Stock, Out of Stock)
├── BulkActions (appears when checkboxes selected)
│   ├── SelectAll Checkbox
│   ├── BulkEditDropdown
│   ├── BulkDeleteButton
│   ├── BulkExportButton
│   └── Selected count: "12 selected"
├── ProductsTable
│   ├── Checkbox column
│   ├── Image column (thumbnail)
│   ├── Name column (searchable)
│   ├── SKU column
│   ├── Category column
│   ├── Price column (right-aligned)
│   ├── Stock column (with warning color if low)
│   ├── Status column (toggle button)
│   ├── Sold column
│   ├── Rating column (stars)
│   └── Actions column (Edit, Delete)
├── PaginationControl
│   ├── Previous button
│   ├── Page numbers (1, 2, 3...)
│   ├── Next button
│   ├── "Showing X-Y of Z" text
│   └── Rows per page dropdown
└── Toast (for success/error messages)
```

## Table Columns

```typescript
interface ProductTableRow {
  id: string;
  image: string; // Thumbnail URL
  name: string;
  sku: string;
  category: string;
  price: number; // Formatted as Rp format
  stock: number; // With color warning if < lowStockLevel
  status: boolean; // Active/Inactive toggle
  sold: number;
  rating: number; // 0-5 stars
  actions: ReactNode; // Edit button, Delete button
}
```

## Search & Filter Logic

```
Search:
- Search by product name OR SKU (case-insensitive)
- Real-time results (debounced)

Category Filter:
- Multi-select or single select
- Show: All Categories, [Category 1], [Category 2], etc.

Status Filter:
- Active
- Inactive

Stock Filter:
- In Stock (stock > 0)
- Low Stock (stock > 0 and < lowStockWarning)
- Out of Stock (stock = 0)
```

## Responsive Design

```
Desktop (1200px+):
- Full table with all columns visible
- Sidebar visible on left

Tablet (768px - 1199px):
- Hide: Rating, Sold columns
- Show: "..." to expand row
- Responsive table with horizontal scroll

Mobile (< 768px):
- Card view instead of table
- Each product = 1 card
- Show: Image, Name, Price, Status
- Swipe to see more details
```

## API Integration

```typescript
// On load & on filter/search change:
GET /api/cp/products
Query: {
  page: 1,
  limit: 20,
  search?: "tahu",
  category?: "uuid",
  status?: "active" | "inactive",
  stock?: "in_stock" | "low_stock" | "out_of_stock",
  sort?: "name" | "price" | "sold"
}

Response: {
  products: ProductTableRow[],
  total: number,
  pages: number
}
```

---

# PAGE 4: Product Create/Edit

## Route

`/cp/products/new` (create) or `/cp/products/[id]` (edit)

## Purpose

Create new or edit existing products

## Full Page Layout

```
┌────────────────────────────────────────────────────────────┐
│ [← Back] TAMBAH PRODUK BARU                  [Save] [Cancel]│
├────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─ BASIC INFO ─┬─ PRICING ─┬─ STOCK ─┬─ VARIANTS ─┐      │
│ │              │            │          │             │      │
│ │ Product Name │ Cost Price │ Total    │ [+ Add]     │      │
│ │ [Input]      │ [Input]    │ [Input]  │ [Table]     │      │
│ │              │            │          │             │      │
│ │ SKU          │ Selling    │ Low Warn │ Variant 1   │      │
│ │ [Input]      │ Price      │ [Input]  │ Stock: 50   │      │
│ │              │ [Input]    │          │             │      │
│ │ Category     │            │          │ Variant 2   │      │
│ │ [Dropdown]   │ Discount % │ History  │ Stock: 30   │      │
│ │              │ [Input]    │ [Log]    │             │      │
│ │ Description  │            │          │ [Edit] [Del]│      │
│ │ [Rich Text]  │ Margin %   │          │             │      │
│ │              │ [Display]  │          │ [+ Add]     │      │
│ │ Status       │            │          │             │      │
│ │ [Toggle]     │            │          │             │      │
│ │              │            │          │             │      │
│ │ Featured     │            │          │             │      │
│ │ [Toggle]     │            │          │             │      │
│ │              │            │          │             │      │
│ └──────────────┴────────────┴──────────┴─────────────┘      │
│                                                             │
│ ┌─ IMAGES ─┬─ SEO (OPTIONAL) ──────────────────────────┐  │
│ │           │                                          │  │
│ │ [Drag/Drop│ Meta Title                               │  │
│ │  area]    │ [Input]                                  │  │
│ │           │                                          │  │
│ │ [Upload]  │ Meta Description                         │  │
│ │ [Crop]    │ [Textarea]                               │  │
│ │           │                                          │  │
│ │ Main ◇    │ Meta Keywords                            │  │
│ │ [Thumb]   │ [Input]                                  │  │
│ │           │                                          │  │
│ │ [Reorder] │ URL Slug                                 │  │
│ │           │ [Input]                                  │  │
│ │ Max 3 img │                                          │  │
│ └───────────┴──────────────────────────────────────────┘  │
│                                                             │
│                    [Save] [Preview] [Cancel]               │
└────────────────────────────────────────────────────────────┘
```

## Tab Components

### Tab 1: Basic Info

```typescript
Form: BasicInfoTab
├── Product Name (string, required)
│   ├── Placeholder: "Nama produk"
│   ├── Help text: "Nama akan ditampilkan di toko"
│   └── Max length: 255 characters
├── SKU (string, required, unique)
│   ├── Placeholder: "Contoh: TAHU-001"
│   ├── Help text: "Kode unik untuk stok management"
│   └── Validation: /^[A-Z0-9-]+$/
├── Category (select, required)
│   ├── Placeholder: "Pilih kategori"
│   ├── Options: [Tahu, Tempe, Sayuran, ...]
│   └── Can search
├── Description (rich text editor)
│   ├── Placeholder: "Deskripsi produk..."
│   ├── Features: Bold, Italic, List, Link
│   └── Max length: 2000 characters
├── Status (toggle)
│   ├── Active / Inactive
│   └── Help text: "Produk aktif akan ditampilkan di toko"
└── Featured (toggle)
    ├── Yes / No
    └── Help text: "Tampilkan di slider kategori"
```

### Tab 2: Pricing

```typescript
Form: PricingTab
├── Cost Price (number, optional)
│   ├── Placeholder: "0"
│   ├── Format: Currency (Rp)
│   └── Help text: "Untuk kalkulasi margin"
├── Selling Price (number, required)
│   ├── Placeholder: "0"
│   ├── Format: Currency (Rp)
│   ├── Min: 0
│   └── Help text: "Harga jual ke pelanggan"
├── Discount Percentage (number, 0-100)
│   ├── Placeholder: "0"
│   ├── Format: "20 %"
│   ├── Help text: "Diskon khusus produk ini"
│   └── onChange: Auto-calculate discount price
├── Discount Price (display only)
│   ├── Label: "Final Price"
│   ├── Calculated: selling_price - (selling_price * discount_percentage / 100)
│   ├── Bold & highlighted
│   └── Format: Rp format
├── Margin Percentage (display only)
│   ├── Calculated: (selling_price - cost_price) / cost_price * 100
│   └── Format: "25.5 %"
└── On Sale (toggle)
    └── Indicate if product is on sale
```

### Tab 3: Stock

```typescript
Form: StockTab
├── Total Stock (number, required)
│   ├── Placeholder: "0"
│   └── Help text: "Total stok semua varian"
├── Low Stock Warning (number)
│   ├── Placeholder: "10"
│   ├── Help text: "Alert jika stok < angka ini"
│   └── Format: "When stock falls below 10 units"
├── Stock Status Display
│   ├── Current: "150 units in stock"
│   ├── Last updated: "5 minutes ago"
│   └── Status indicator (Green / Yellow / Red)
├── Stock History Log (Table, read-only)
│   ├── Columns: Date, Type, Quantity, Previous, New, Reason
│   ├── Type: sold, adjustment, return
│   ├── Pagination: Show last 10 entries
│   └── [View all history] Link (opens modal or separate page)
└── Manual Stock Adjustment (if needed)
    ├── [+ Add Adjustment] Button
    ├── Modal:
    │   ├── Adjustment Type (sold, returned, adjustment)
    │   ├── Quantity
    │   ├── Reason (dropdown/text)
    │   └── [Submit]
```

### Tab 4: Variants

```typescript
Form: VariantsTab
├── [+ Add Variant] Button
├── Variants Table
│   ├── Variant Name (editable cell)
│   ├── Stock (editable cell)
│   ├── Price Modifier (editable cell)
│   │   ├── Format: "+Rp 5.000" or "-Rp 2.000"
│   │   └── Affects final price of this variant
│   ├── Final Price (display only)
│   │   └── Calculated: base_price + modifier
│   └── Actions: Edit icon, Delete icon
│
└── Add Variant Modal (when [+ Add] clicked)
    ├── Variant Name (required)
    │   ├── Placeholder: "Contoh: Red, Large"
    │   └── Help text: "Nama varian yang akan ditampilkan"
    ├── Stock (required)
    │   ├── Placeholder: "0"
    │   └── Validation: >= 0
    ├── Price Modifier (optional)
    │   ├── Placeholder: "0"
    │   ├── Format: Currency
    │   └── Can be negative
    └── Buttons: [Save] [Cancel]
```

### Tab 5: Images

```typescript
Form: ImagesTab
├── Image Upload Area
│   ├── Drag & drop zone
│   ├── Text: "Drag images here or"
│   ├── [Browse Files] Button
│   └── Accepts: .jpg, .png, .webp (max 5MB per image)
├── Image List (max 3 images)
│   ├── Image 1 (thumbnail)
│   │   ├── Main indicator (radio button selected)
│   │   ├── Crop button
│   │   ├── Delete button
│   │   └── Drag handle (reorder)
│   ├── Image 2
│   │   ├── Set as main (radio)
│   │   ├── Crop button
│   │   ├── Delete button
│   │   └── Drag handle
│   └── ... (up to 3 images)
└── Image Crop Modal (when crop clicked)
    ├── Image preview with crop tool
    ├── Aspect ratio selector (1:1, 4:3, 16:9, Free)
    ├── Crop handles to resize
    ├── [Apply] [Cancel] buttons
    └── Preview: "Image will be 1080x600px"
```

### Tab 6: SEO (Optional)

```typescript
Form: SEOTab
├── Meta Title
│   ├── Placeholder: "Product Name"
│   ├── Max length: 60 characters
│   ├── Character counter
│   └── Help text: "Judul di search results"
├── Meta Description
│   ├── Placeholder: "Deskripsi singkat produk..."
│   ├── Max length: 160 characters
│   ├── Character counter
│   └── Help text: "Deskripsi di search results"
├── Meta Keywords
│   ├── Placeholder: "kata kunci, lainnya, etc"
│   ├── Help text: "Pisahkan dengan koma"
│   └── Tag input (add/remove tags)
└── URL Slug
    ├── Auto-generated from product name
    ├── Can be manually edited
    ├── Format: /product/{slug}
    ├── Validation: /^[a-z0-9-]+$/
    └── Help text: "URL produk di toko"
```

## Form Validation

```typescript
Validation Rules:
├── Product Name
│   ├── Required: "Nama produk wajib diisi"
│   ├── Min 3: "Minimal 3 karakter"
│   └── Max 255: "Maksimal 255 karakter"
├── SKU
│   ├── Required: "SKU wajib diisi"
│   ├── Unique: "SKU sudah digunakan"
│   ├── Format: "SKU hanya boleh huruf, angka, dan dash"
│   └── Min 3: "Minimal 3 karakter"
├── Category
│   └── Required: "Kategori wajib dipilih"
├── Selling Price
│   ├── Required: "Harga wajib diisi"
│   ├── Min 0: "Harga tidak boleh negatif"
│   └── Number: "Harus berupa angka"
├── Total Stock
│   ├── Required: "Total stok wajib diisi"
│   └── Min 0: "Stok tidak boleh negatif"
├── Images
│   ├── Required: "Minimal 1 gambar diperlukan"
│   ├── Max 3: "Maksimal 3 gambar"
│   ├── Format: "Format gambar tidak didukung"
│   └── Size: "Ukuran gambar maksimal 5MB"
└── SKU Uniqueness
    └── Real-time validation via API call
```

## Form Actions

```
[Save] Button:
├── Validate all fields
├── Show loading spinner
├── POST/PUT to API
├── On success:
│   ├── Show toast: "Produk berhasil disimpan"
│   └── Redirect to /cp/products
└── On error:
    ├── Show toast with error message
    └── Scroll to first error field

[Preview] Button:
├── Open modal showing product preview
├── Display as it appears in store
├── [View in Store] link

[Cancel] Button:
├── If form has changes, show confirmation
├── Redirect to /cp/products
└── No changes, go back immediately
```

---

# PAGE 5: Categories

## Route

`/cp/categories`

## Purpose

Manage product categories with drag-reorder

## Full Page Layout

```
┌────────────────────────────────────────────────────────────┐
│ KATEGORI PRODUK                          [+ Tambah Kategori]│
├────────────────────────────────────────────────────────────┤
│                                                             │
│ [Search]                                                    │
│                                                             │
│ Drag kategori untuk mengubah urutan                        │
│                                                             │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ⋮⋮ 🍜 Tahu & Tempe           125 products  ○ Active  │ │
│ │ ⋮⋮ 🥬 Sayuran               98 products   ○ Active  │ │
│ │ ⋮⋮ 🌽 Buah-buahan           76 products   ○ Active  │ │
│ │ ⋮⋮ 🥒 Bumbu & Rempah        45 products   ⚫ Inactive│ │
│ │ ⋮⋮ ...                       ...          ...      │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│                      [Save Order] [Cancel]                 │
└────────────────────────────────────────────────────────────┘
```

## Component Breakdown

```
CategoriesPage
├── Header
│   ├── PageTitle: "Kategori Produk"
│   └── [+ Tambah Kategori] Button
├── SearchInput
│   └── Placeholder: "Cari kategori..."
├── InfoText
│   └── "Drag kategori untuk mengubah urutan tampilan"
├── DraggableCategoryList
│   ├── CategoryCard (x N)
│   │   ├── DragHandle (::)
│   │   ├── Icon (from category)
│   │   ├── Category Name
│   │   ├── Product Count badge
│   │   ├── Status Toggle (active/inactive)
│   │   ├── Featured Toggle (show on home)
│   │   └── Actions (Edit, Delete)
│   └── (Using react-beautiful-dnd or similar)
├── SaveReorderButtons (appears after drag)
│   ├── [Save Order] Button
│   └── [Cancel] Button (undo)
└── CategoryFormModal (add/edit)
    ├── Category Name (required)
    ├── Icon Picker Dropdown
    │   ├── Search icon by name
    │   ├── Show 20+ Lucide icons
    │   └── Preview selected icon
    ├── Display Order (shows current position)
    ├── Status Toggle
    ├── Featured Toggle
    │   └── Help text: "Tampilkan di slider kategori di home"
    ├── Description (optional)
    ├── Color Theme (color picker)
    ├── [Save] [Cancel] buttons
```

## Category Card Layout

```
┌─────────────────────────────────────────────────────────┐
│ ⋮⋮  [Icon] Category Name            125 Products  [Tog]  │
│     [Edit] [Del]                                          │
└─────────────────────────────────────────────────────────┘

Mouse Hover:
├── Background slightly lighter
├── [Edit] [Delete] buttons appear/highlight
└── Drag handle becomes more visible
```

## Drag & Reorder Logic

```
1. User drags category up/down
2. Other categories shift smoothly
3. Order updates in UI immediately
4. "Save Order" & "Cancel" buttons appear
5. User clicks "Save Order":
   ├── POST /api/cp/categories/reorder
   ├── Body: { categories: [{id, sort_order}, ...] }
   ├── On success: Hide save buttons, show toast
   └── On error: Revert changes, show error toast
6. User clicks "Cancel":
   ├── Revert to original order
   └── Hide save buttons
```

## API Calls

```typescript
// Get all categories
GET /api/cp/categories
Response: { categories: Category[] }

// Create category
POST /api/cp/categories
Body: { name, icon, sort_order, is_featured, status, description }

// Update category
PUT /api/cp/categories/[id]
Body: Partial<Category>

// Delete category
DELETE /api/cp/categories/[id]

// Save reordered categories
PUT /api/cp/categories/reorder
Body: { categories: [{id: string, sort_order: number}, ...] }
```

---

# PAGE 6: Orders List

## Route

`/cp/orders`

## Purpose

View all orders with status filtering, search, and quick actions

## Full Page Layout

```
┌────────────────────────────────────────────────────────────┐
│ PESANAN                                      [Export CSV]   │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ ☐ Semua ☐ Menunggu ☐ Verifikasi ☐ Dikonfirmasi ...      │
│                                                             │
│ [Search Order ID] [Date Range ▼] [Filter ▼]              │
│                                                             │
│ ┌────────────────────────────────────────────────────────┐│
│ │ Order ID │ Customer │ Items │ Date │ Amount │ Status   ││
│ ├────────────────────────────────────────────────────────┤│
│ │ #ORD-001 │ Ahmad    │ 3     │ 2 h  │ Rp 150K│ Packed  ││
│ │ #ORD-002 │ Budi     │ 1     │ 5 h  │ Rp 75K │ Shipped ││
│ │ #ORD-003 │ Citra    │ 2     │ 1 d  │ Rp 250K│ Pending ││
│ │ ...                                                    ││
│ └────────────────────────────────────────────────────────┘│
│                                                             │
│ Showing 1-20 of 245 orders    [< 1 2 3 >] Show: 20 ▼     │
└────────────────────────────────────────────────────────────┘
```

## Tab/Filter Navigation

```
Tabs (Top of list):
├── ☐ All (show all orders)
├── ☐ Menunggu Bayar
├── ☐ Pembayaran Verifikasi
├── ☐ Pesanan Dikonfirmasi
├── ☐ Sedang Dikemas
├── ☐ Siap Dikirim
├── ☐ Dalam Pengiriman
├── ☐ Terkirim
├── ☐ Selesai
└── ☐ Dibatalkan

Note: Clicking a tab filters the table to show only orders with that status
```

## Component Breakdown

```
OrdersPage
├── Header
│   ├── PageTitle: "Pesanan"
│   └── [Export CSV] Button
├── StatusTabs (horizontal)
│   └── Tab items (clickable, shows badge with count)
├── SearchAndFilters
│   ├── SearchInput (by Order ID or Customer name)
│   ├── DateRangePicker
│   │   ├── Preset: Today, Last 7 days, This month, Custom
│   │   └── Show orders from X to Y
│   ├── AdvancedFilter Button
│   │   └── Opens modal with more filters:
│   │       ├── Payment method
│   │       ├── Payment status
│   │       └── Min/Max amount range
│   └── [Clear Filters] Link (appears if filters active)
├── OrdersTable
│   ├── Order ID column (clickable → detail page)
│   ├── Customer Name column
│   ├── Item Count column
│   ├── Order Date column
│   ├── Total Amount column (right-aligned)
│   ├── Payment Method column (icon)
│   ├── Status column (badge with color)
│   ├── Actions column (View button)
│   └── ... more columns
├── PaginationControl
└── Stats (footer)
    ├── "Total: 245 orders"
    ├── "Total Revenue (this view): Rp 15.2M"
    └── Last updated timestamp
```

## Table Row Specification

```typescript
interface OrderTableRow {
  id: string;
  orderNumber: string; // #ORD-001
  customerName: string;
  itemCount: number;
  orderDate: Date;
  amount: number; // Rp format
  paymentMethod: string; // 'cod', 'ewallet', 'bank'
  paymentStatus: string; // 'pending', 'confirmed', 'failed'
  orderStatus: string; // 8 statuses
  statusBadgeColor: string; // color for badge
}
```

## Status Badge Colors

```
Menunggu Bayar:          Yellow    (#EAB308)
Pembayaran Verifikasi:   Orange    (#F97316)
Pesanan Dikonfirmasi:    Blue      (#3B82F6)
Sedang Dikemas:          Purple    (#8B5CF6)
Siap Dikirim:           Indigo     (#6366F1)
Dalam Pengiriman:       Cyan       (#06B6D4)
Terkirim:               Teal       (#14B8A6)
Selesai:                Green      (#22C55E)
Dibatalkan:             Red        (#EF4444)
```

## Responsive Behavior

```
Desktop (1200px+):
├── Show all columns
└── Full table view

Tablet (768px - 1199px):
├── Hide: Payment Method, Payment Status columns
├── Show: "..." menu for row actions
└── Horizontal scroll enabled

Mobile (< 768px):
├── Card view (each order = 1 card)
├── Show: Order ID, Customer, Date, Amount, Status
├── Swipe right for action buttons
```

---

# PAGE 7: Order Detail

## Route

`/cp/orders/[id]`

## Purpose

View complete order information, update status, manage payment/shipping

## Full Page Layout

```
┌──────────────────────────────────────────────────────────┐
│ [← Back]  Order #ORD-001                              [X]│
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Order Date: 2 jam lalu │ Status: [Dikemas ▼]            │
│                                                          │
│ ┌─────────────────────┐  ┌──────────────────────────┐  │
│ │ Customer Info       │  │ Delivery Info            │  │
│ │ Name: Ahmad         │  │ Name: Ahmad K.           │  │
│ │ Email: a@email.com  │  │ Phone: 08123456789       │  │
│ │ Phone: 08123456789  │  │ Address: Jl. Merdeka... │  │
│ │                     │  │                          │  │
│ │ [View Profile]      │  │ [Edit Address]           │  │
│ └─────────────────────┘  └──────────────────────────┘  │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐│
│ │ ORDER ITEMS                                          ││
│ │ ┌──────────────────────────────────────────────────┐││
│ │ │ 🍜 Tahu Goreng │ Qty: 2 │ Rp 50K × 2 = Rp 100K │││
│ │ │ Variant: Regular                                 │││
│ │ ├──────────────────────────────────────────────────┤││
│ │ │ 🥬 Sayuran │ Qty: 1 │ Rp 25K × 1 = Rp 25K     │││
│ │ └──────────────────────────────────────────────────┘││
│ │                                                      ││
│ │ Subtotal:       Rp 125.000                           ││
│ │ Discount:       - Rp 0                              ││
│ │ Shipping:       + Rp 25.000                          ││
│ │ ──────────────────────────────────                  ││
│ │ GRAND TOTAL:    Rp 150.000                          ││
│ └──────────────────────────────────────────────────────┘│
│                                                          │
│ ┌──────────────┐  ┌────────────────┐  ┌──────────────┐ │
│ │ PAYMENT      │  │ SHIPPING       │  │ TIMELINE     │ │
│ │ Method: Bank │  │ Courier: JNE   │  │ ✓ Confirmed  │ │
│ │ Status: ⏳ Waiting│ Track: #2389... │ ✓ Dikemas     │ │
│ │ [Verify Proof]   │ Est: 2024-01-15 │ → Dikirim     │ │
│ │ [Confirm]    │  │ [Track Online]  │  │ → Terkirim   │ │
│ └──────────────┘  └────────────────┘  └──────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐│
│ │ NOTES & ACTIONS                                      ││
│ │                                                      ││
│ │ Customer Notes: "Tolong yang terbaik"                ││
│ │ Internal Notes: [+ Add Note]                         ││
│ │                                                      ││
│ │ [Update Status ▼] [Print Invoice] [Notify Cust]    ││
│ │ [Chat with Customer]                                ││
│ │                                                      ││
│ └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

## Component Breakdown

```
OrderDetailPage
├── Header
│   ├── Back button
│   ├── Order Number & Date
│   ├── Status Dropdown (update status)
│   └── Close (X) button
├── Section: Customer Info (2-col card)
│   ├── Customer Name
│   ├── Email
│   ├── Phone
│   └── [View Full Profile] Link
├── Section: Delivery Address (2-col card)
│   ├── Delivery Name
│   ├── Phone
│   ├── Full Address
│   ├── Map (optional, show location)
│   └── [Edit] Button
├── Section: Order Items (full-width)
│   ├── Item Card (for each item)
│   │   ├── Product Image
│   │   ├── Product Name
│   │   ├── Quantity
│   │   ├── Unit Price
│   │   ├── Subtotal
│   │   └── Variant info (if any)
│   └── Total Summary
│       ├── Subtotal
│       ├── Discount
│       ├── Shipping
│       └── Grand Total (highlighted)
├── Section: Payment (3-col)
│   ├── Payment Method (display)
│   ├── Payment Status (badge)
│   ├── Payment Proof (image or upload area)
│   ├── Confirmed At (timestamp)
│   └── [Confirm Payment] Button (if pending)
├── Section: Shipping (3-col)
│   ├── Courier
│   ├── Tracking Number
│   ├── Estimated Delivery
│   └── [View Tracking] Link
├── Section: Timeline (3-col)
│   ├── Status History (vertical timeline)
│   ├── Each status entry with timestamp
│   └── Current status highlighted
├── Section: Notes & Actions (full-width)
│   ├── Customer Notes (display only)
│   ├── Internal Notes Section
│   │   ├── Add new note (textarea)
│   │   ├── List of previous notes
│   │   └── Note by & timestamp
│   └── Action Buttons
│       ├── [Update Status] Dropdown
│       ├── [Print Invoice] Button
│       ├── [Notify Customer] Button
│       ├── [Chat] Button
│       ├── [Cancel Order] (if applicable)
│       ├── [Process Refund] (if applicable)
│       └── [More Actions] Menu
└── Toast (for success/error messages)
```

## Status Update Modal

```
When user clicks "Update Status" dropdown:

┌──────────────────────────────┐
│ Update Order Status          │
├──────────────────────────────┤
│ Current: Pesanan Dikonfirmasi │
│                              │
│ New Status:                  │
│ ○ Menunggu Bayar             │
│ ○ Pembayaran Verifikasi      │
│ ● Pesanan Dikonfirmasi       │
│ ○ Sedang Dikemas             │
│ ○ Siap Dikirim               │
│ ○ Dalam Pengiriman           │
│ ○ Terkirim                   │
│ ○ Selesai                    │
│ ○ Dibatalkan                 │
│                              │
│ Notes (optional):            │
│ [Textarea]                   │
│                              │
│ [Update] [Cancel]            │
└──────────────────────────────┘

Special cases:
- If updating to "Dibatalkan", show reason dropdown
- If updating to "Dalam Pengiriman", show shipping form
- If updating to "Selesai", show completion confirmation
```

## Payment Confirmation

```
If Payment Status = "pending":

┌─────────────────────────┐
│ Pending Payment Proof   │
├─────────────────────────┤
│ [Upload or paste image] │
│                         │
│ [Confirm Payment] Btn   │
│ [Reject] Btn            │
└─────────────────────────┘

If "Verifikasi" status:
- Show payment proof image
- Admin can confirm/reject
```

## Shipping Form (when shipping)

```
When updating status to "Siap Dikirim":

┌──────────────────────────┐
│ Shipping Information     │
├──────────────────────────┤
│ Courier:                 │
│ [JNE ▼]                  │
│                          │
│ Tracking Number:         │
│ [Input tracking #]       │
│                          │
│ Est. Delivery Date:      │
│ [Date Picker]            │
│                          │
│ [Ship] [Cancel]          │
└──────────────────────────┘
```

## Timeline Display

```
Timeline (Vertical):

✓ Order Placed
  2024-01-12 10:30 AM

✓ Payment Confirmed
  2024-01-12 11:00 AM

✓ Order Confirmed
  2024-01-12 12:00 PM
  Admin: Ahmad

✓ Packed
  2024-01-13 09:00 AM

→ In Shipping (Current)
  2024-01-13 10:00 AM
  Tracking: #JNE123456

- Delivered (Pending)
  Est. 2024-01-15

- Completed (Pending)

Blue line connects all items
Current status highlighted
```

---

# PAGE 8: Reviews Moderation

## Route

`/cp/reviews`

## Purpose

Approve/reject/moderate customer product reviews

## Full Page Layout

```
┌────────────────────────────────────────────────────────────┐
│ REVIEW & RATING                                  [Search]  │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ ☐ Semua ☐ Pending ☐ Approved ☐ Rejected  [Sort ▼]       │
│                                                             │
│ ┌────────────────────────────────────────────────────────┐│
│ │ ☐ Review Card (pending, newest first)               ││
│ │                                                      ││
│ │ 🍜 Product Name │ ⭐⭐⭐⭐⭐ │ Ahmad K.  │ 2 h ago     ││
│ │ "Produk sangat memuaskan"...                        ││
│ │ 👍 12 people found this helpful                      ││
│ │                                                      ││
│ │ [View Full] [Approve] [Reject]                      ││
│ │                                                      ││
│ ├────────────────────────────────────────────────────────┤│
│ │ ☐ Review Card (pending)                            ││
│ │ ...                                                  ││
│ └────────────────────────────────────────────────────────┘│
│                                                             │
│ Showing 1-10 of 45 pending reviews                        │
└────────────────────────────────────────────────────────────┘
```

## Tab Navigation

```
Tabs:
├── ☐ All (show all reviews)
├── ☐ Pending (need approval) - Shows count badge
├── ☐ Approved (published)
└── ☐ Rejected (rejected reviews)
```

## Component Breakdown

```
ReviewsPage
├── Header
│   ├── PageTitle: "Review & Rating"
│   └── SearchInput (by product name)
├── StatusTabs
│   └── Tab items with count badge
├── SortDropdown
│   ├── Newest first
│   ├── Oldest first
│   ├── Highest rating
│   ├── Lowest rating
│   └── Most helpful
├── ReviewsList
│   ├── ReviewCard (x N)
│   │   ├── Checkbox (for bulk actions)
│   │   ├── Product Image
│   │   ├── Product Name
│   │   ├── Rating (star display)
│   │   ├── Customer Name (partial censored)
│   │   ├── Review Text (truncated)
│   │   ├── Review Date
│   │   ├── Helpful Count ("👍 12 helpful")
│   │   ├── Review Media Indicator (if has images/videos)
│   │   └── Actions: [View Full] [Approve] [Reject] [Delete]
│   └── ... more cards
├── PaginationControl
└── Stats (footer)
    ├── "Total reviews: 245"
    ├── "Pending approval: 12"
    ├── "Approval rate: 94%"
```

## Review Card Detail

```
┌────────────────────────────────────────────────────────────┐
│ ☐ 🍜 Tahu Goreng │ ⭐⭐⭐⭐☆ (4) │ Budi L. │ 3 days ago  │
├────────────────────────────────────────────────────────────┤
│ "Produk sangat enak dan segar! Dikemas dengan baik."       │
│                                                             │
│ [Image] [Image]  (Shows count: +2 more images)             │
│                                                             │
│ 👍 15 helpful  👎 1 unhelpful  Verified Purchase ✓         │
│                                                             │
│ [View Full Review] [Approve] [Reject] [Delete]             │
└────────────────────────────────────────────────────────────┘
```

## Review Detail Modal

```
When [View Full Review] clicked:

┌──────────────────────────────────────────────────┐
│ Review Detail                                    │
├──────────────────────────────────────────────────┤
│                                                  │
│ Product: 🍜 Tahu Goreng                          │
│ Rating: ⭐⭐⭐⭐☆ (4 out of 5)                    │
│                                                  │
│ Customer: Budi L. (since 2023-01-15)             │
│ Avatar: [Image]                                  │
│ Verified Purchase: ✓ (Order #ORD-2024-001)       │
│                                                  │
│ ┌────────────────────────────────────────────┐  │
│ │ "Produk sangat enak dan segar! Dikemas      │  │
│ │  dengan baik. Akan pesan lagi. Terima       │  │
│ │  kasih seller."                             │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ Images (3):                                      │
│ [Image1] [Image2] [Image3]                       │
│                                                  │
│ Helpful Votes: 👍 15  👎 1                       │
│ Posted: 2024-01-10 14:30                        │
│                                                  │
│ ──────────────────────────────────────────────  │
│                                                  │
│ Moderation Actions:                              │
│                                                  │
│ Status: [Pending ▼]                              │
│ Options: Pending / Approved / Rejected           │
│                                                  │
│ Rejection Reason (if rejecting):                 │
│ ○ Spam/Duplicate                                 │
│ ○ Inappropriate content                          │
│ ○ Offensive language                             │
│ ○ Not relevant                                   │
│ ○ Other: [Text]                                  │
│                                                  │
│ Admin Notes:                                     │
│ [Textarea]                                       │
│                                                  │
│ [Approve] [Reject] [Delete] [Close]              │
└──────────────────────────────────────────────────┘
```

## Bulk Actions

```
When reviews are selected via checkboxes:

Show bar at top:
┌────────────────────────────────────────────┐
│ ☐ Select All  (12 selected)                │
│ [Approve All] [Reject All] [Delete All]    │
└────────────────────────────────────────────┘

Actions apply to all selected reviews
```

---

# PAGE 9: Banners Management

## Route

`/cp/banners`

## Purpose

Manage homepage carousel banners

## Full Page Layout

```
┌────────────────────────────────────────────────────────────┐
│ BANNER CAROUSEL                          [+ Tambah Banner] │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ Drag banner untuk mengubah urutan carousel               │
│                                                             │
│ ┌────────────────────────────────────────────────────────┐│
│ │ ⋮⋮ Banner 1                          Active    Clicks: 245 ││
│ │    [Preview Image] Link to: Product "Tahu"              ││
│ │    Scheduled: 2024-01-15 to 2024-02-15                  ││
│ │    [Edit] [Delete]                                      ││
│ ├────────────────────────────────────────────────────────┤│
│ │ ⋮⋮ Banner 2                        Inactive   Clicks: 0  ││
│ │    [Preview Image] Link to: Category "Sayuran"          ││
│ │    Status: Scheduled for 2024-01-20                    ││
│ │    [Edit] [Delete]                                      ││
│ └────────────────────────────────────────────────────────┘│
│                                                             │
│                      [Save Order] [Cancel]                 │
└────────────────────────────────────────────────────────────┘
```

## Component Breakdown

```
BannersPage
├── Header
│   ├── PageTitle: "Banner Carousel"
│   ├── InfoText: "Carousel auto-plays every 5 seconds"
│   └── [+ Tambah Banner] Button
├── InfoText
│   └── "Drag banner untuk mengubah urutan"
├── DraggableBannerList
│   ├── BannerItem (x N, draggable)
│   │   ├── DragHandle (::)
│   │   ├── Banner Preview (thumbnail, 400x225px)
│   │   ├── Banner Info
│   │   │   ├── Title
│   │   │   ├── Status Badge (Active/Inactive/Scheduled)
│   │   │   ├── Link Type & Target
│   │   │   ├── Schedule dates (if scheduled)
│   │   │   ├── Click Count
│   │   │   └── Impression Count
│   │   └── Actions: [Edit] [Analytics] [Delete]
│   └── (Using react-beautiful-dnd)
├── SaveReorderButtons (appears after drag)
│   ├── [Save Order] Button
│   └── [Cancel] Button
└── BannerFormModal (add/edit)
    ├── Title (required)
    ├── Image Upload
    │   ├── Drag & drop or click to upload
    │   ├── Image preview with crop
    │   ├── Recommended: 1080x600px
    │   └── Image Crop Tool
    ├── Link Configuration
    │   ├── Link Type (None, URL, Product, Category)
    │   ├── Link Target (input or dropdown)
    │   └── Preview: "Link to: Product 'Tahu Goreng'"
    ├── Schedule Section
    │   ├── Status (Immediate or Scheduled)
    │   ├── Start Date/Time
    │   ├── End Date/Time
    │   └── Repeat (Never, Daily, Weekly, Monthly)
    ├── Display Settings
    │   ├── Active Toggle
    │   └── Position Order
    └── [Save] [Preview] [Cancel]
```

## Banner Item Card

```
┌──────────────────────────────────────────────────────────────┐
│ ⋮⋮  [Thumbnail 400x225]  Title                Active  Clicks:245 │
│    Link: Product "Tahu Goreng"                               │
│    Date: 2024-01-15 to 2024-02-15                           │
│    [Edit] [Delete]                                          │
└──────────────────────────────────────────────────────────────┘
```

---

# PAGE 10: Promotions Management

## Route

`/cp/promotions`

## Purpose

Create and manage discount codes and campaigns

## Full Page Layout

```
┌────────────────────────────────────────────────────────────┐
│ PROMOSI & DISKON                         [+ Buat Promosi]  │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ ☐ Semua ☐ Active ☐ Scheduled ☐ Expired ☐ Archived        │
│                                                             │
│ ┌────────────────────────────────────────────────────────┐│
│ │ ☐ Promo Card                                         ││
│ │ Code: SAVE20                                         ││
│ │ Discount: 20% off                                    ││
│ │ Period: 2024-01-10 to 2024-01-31 (Active)           ││
│ │ Usage: 45 / 100 max uses (45%)                       ││
│ │ Scope: All Products                                  ││
│ │ [Edit] [Pause] [Delete]                             ││
│ ├────────────────────────────────────────────────────────┤│
│ │ ☐ Promo Card                                         ││
│ │ ...                                                   ││
│ └────────────────────────────────────────────────────────┘│
│                                                             │
│ Showing 1-20 of 15 promotions                             │
└────────────────────────────────────────────────────────────┘
```

## Component Breakdown

```
PromotionsPage
├── Header
│   ├── PageTitle: "Promosi & Diskon"
│   └── [+ Buat Promosi] Button
├── StatusTabs (All, Active, Scheduled, Expired, Archived)
├── PromosList
│   ├── PromoCard (x N)
│   │   ├── Title
│   │   ├── Code (if applicable)
│   │   ├── Discount Display (20% or Rp 50.000)
│   │   ├── Period (start to end)
│   │   ├── Status Badge (Active/Scheduled/Expired)
│   │   ├── Usage Progress Bar (used / max)
│   │   ├── Scope (All/Categories/Products/Users)
│   │   └── Actions: [Edit] [Pause/Resume] [Delete]
│   └── ... more cards
├── PaginationControl
└── PromotionFormModal
    ├── Title (required)
    ├── Code (optional, auto-generate option)
    │   └── Validation: unique, alphanumeric + dash
    ├── Description
    ├── Discount Type
    │   ├── ○ Percentage (0-100%)
    │   ├── ○ Fixed Amount (Rp)
    │   └── ○ Buy X Get Y Free
    ├── Discount Details
    │   ├── Value input
    │   ├── Min Purchase (optional)
    │   ├── Max Discount Cap (if percentage)
    │   └── Exclude Products/Categories (if any)
    ├── Scope Section
    │   ├── Apply to:
    │   │   ├── ○ All Products
    │   │   ├── ○ Specific Categories (multi-select)
    │   │   ├── ○ Specific Products (multi-select)
    │   │   └── ○ Specific Users (optional)
    │   └── Preview: "Will apply to 125 products"
    ├── Usage Limits
    │   ├── Max Uses (unlimited or number)
    │   ├── Max Per User (unlimited or number)
    │   └── Exclude: [products/categories]
    ├── Period
    │   ├── ○ Immediate
    │   ├── ○ Scheduled
    │   │   ├── Start Date/Time
    │   │   ├── End Date/Time
    │   │   └── Repeat (one-time, yearly)
    │   └── [Preview] Actual dates
    ├── Status (Active/Inactive)
    └── [Save] [Preview] [Cancel]
```

## Promo Card Layout

```
┌────────────────────────────────────────────────────────────┐
│ SAVE20  │  Diskon 20% off  │  Active                      │
│ "Hemat lebih banyak untuk pembelian hari ini"             │
│ Period: 2024-01-10 - 2024-01-31                          │
│ Scope: All Products (125 items)                            │
│                                                             │
│ Usage: ██████░░░░ 45 / 100  (45%)                         │
│                                                             │
│ [Edit]  [Pause]  [Delete]  [View Usage Stats]             │
└────────────────────────────────────────────────────────────┘
```

---

# PAGE 11: Chat Management

## Route

`/cp/chat`

## Purpose

Manage customer support chats

## Full Page Layout

```
┌────────────────────────────────────────────────────────────┐
│ MANAJEMEN CHAT                                  [Search]   │
├──────────────────┬─────────────────────────────────────────┤
│ Chat Rooms (L)   │ Chat Detail (R)                         │
├──────────────────┼─────────────────────────────────────────┤
│                  │                                         │
│ ☐ All ☐ New     │ Ahmad K. (Online)                       │
│ ☐ Waiting        │ Product: Tahu Goreng                    │
│ ☐ Resolved       │                                         │
│                  │ ┌──────────────────────────────────┐   │
│ ┌──────────────┐ │ │ Admin: Tahu berkualitas premium │   │
│ │ [Avatar]     │ │ │ 10:30                            │   │
│ │ Ahmad K.     │ │ └──────────────────────────────────┘   │
│ │ "Berapa harg"│ │                                        │
│ │ 5 min ago    │ │ ┌──────────────────────────────────┐   │
│ │ [2]          │ │ │ Customer: Ada diskon?             │   │
│ │ Online ●     │ │ │ 10:35                            │   │
│ ├──────────────┤ │ └──────────────────────────────────┘   │
│ │              │ │                                        │
│ │ [Avatar]     │ │ Quick Replies:                         │
│ │ Budi L.      │ │ [Stok terbatas - ...] [Beli di ...]   │
│ │ "Dimana alamt│ │                                        │
│ │ 1 hour ago   │ │ Chat Input:                            │
│ │ [1]          │ │ [Message input area        ] [Send]    │
│ │ Offline ○    │ │                                        │
│ └──────────────┘ │                                        │
│                  │ [Resolve Chat] [Assign Staff]           │
└────────────────────────────────────────────────────────────┘
```

## Component Breakdown

```
ChatManagementPage
├── Layout: SplitPane (left sidebar + right content)
├── LeftSidebar: ChatRoomsList
│   ├── StatusTabs (All, New, Waiting, Resolved)
│   ├── SearchInput (by customer name)
│   ├── ChatRoomItem (x N)
│   │   ├── Customer Avatar
│   │   ├── Customer Name
│   │   ├── Last Message Preview (truncated)
│   │   ├── Timestamp
│   │   ├── Unread Badge (if new messages)
│   │   ├── Status Indicator (Online/Offline)
│   │   └── Click to open chat detail
│   └── [Load More]
├── RightContent: ChatDetail
│   ├── ChatHeader
│   │   ├── Customer Name
│   │   ├── Status (Online/Offline)
│   │   ├── Chat Type (CS/Product/Order)
│   │   ├── Context Info (product/order snippet)
│   │   └── Actions: [Info] [Assign] [Resolve]
│   ├── MessageThread
│   │   ├── Message Bubble (customer)
│   │   │   ├── Avatar
│   │   │   ├── Message Text
│   │   │   ├── Timestamp
│   │   │   ├── Read status
│   │   │   └── Reply option
│   │   ├── Message Bubble (admin)
│   │   │   └── (Similar structure)
│   │   ├── Product/Order Snippet (context)
│   │   └── Auto-scroll to latest message
│   ├── QuickReplies
│   │   ├── [Common answer 1]
│   │   ├── [Common answer 2]
│   │   └── [+ More] menu
│   ├── ChatInputArea
│   │   ├── Text input
│   │   ├── Emoji picker
│   │   ├── Attachment button
│   │   └── [Send] button
│   └── ChatActions
│       ├── [Assign to Staff] Dropdown
│       ├── [Add Tag/Label]
│       └── [Resolve Chat] Button
└── Toast (for messages, assignments)
```

## Quick Replies

```
Pre-defined quick replies that can be used:

Customer Service:
├── "Terima kasih sudah menghubungi kami. Ada yang bisa dibantu?"
├── "Mohon tunggu sebentar, kami sedang proses order Anda"
├── "Produk sedang ada promo khusus, buruan pesan!"
└── [+ New Quick Reply]

Product Questions:
├── "Produk tersedia dalam 2 ukuran: Small dan Large"
├── "Bahan produk 100% natural, tanpa pengawet"
└── [+ New Quick Reply]

Admin can:
├── Create new quick replies
├── Organize by category
├── Mark favorites
└── Click to insert into message
```

---

# PAGE 12: Users Management

## Route

`/cp/users`

## Purpose

View and manage customer accounts

## Full Page Layout

```
┌────────────────────────────────────────────────────────────┐
│ MANAJEMEN USER                              [Search]       │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ ☐ All ☐ Active ☐ Suspended ☐ Unverified  [Export CSV]    │
│                                                             │
│ [Sort ▼]                                                   │
│                                                             │
│ ┌────────────────────────────────────────────────────────┐│
│ │ User ID │ Name │ Email │ Reg Date │ Orders │ Spent   ││
│ ├────────────────────────────────────────────────────────┤│
│ │ #USR-01 │ Ahmad │ a@.. │ Jan 10 │ 5 │ Rp 1.5M  ││
│ │ #USR-02 │ Budi  │ b@.. │ Jan 15 │ 12 │ Rp 3.2M ││
│ │ ...                                                   ││
│ └────────────────────────────────────────────────────────┘│
│                                                             │
│ Showing 1-20 of 1,245 users                              │
└────────────────────────────────────────────────────────────┘
```

## Component Breakdown

```
UsersPage
├── Header
│   ├── PageTitle: "Manajemen User"
│   └── [Export CSV] Button
├── StatusTabs (All, Active, Suspended, Unverified)
├── SearchInput (by name or email)
├── SortDropdown (newest, most orders, highest spent)
├── UsersTable
│   ├── User ID (clickable)
│   ├── Name
│   ├── Email
│   ├── Registration Date
│   ├── Last Login
│   ├── Total Orders
│   ├── Total Spent (Rp)
│   ├── Status Badge (Active/Suspended/Unverified)
│   └── Actions: [View] [Suspend] [Delete]
├── PaginationControl
└── Stats (footer)
    ├── "Total users: 1,245"
    ├── "Active: 1,200"
    ├── "Suspended: 25"
    └── "Unverified: 20"
```

## User Profile Detail

```
When clicking a user:

┌────────────────────────────────────────────────────────────┐
│ [← Back] User Profile: Ahmad K.                           │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ [Avatar] Ahmad K.        │ Status: ✓ Active               │
│ Joined: Jan 10, 2024     │ [Suspend] [Delete]             │
│ Last Seen: 2 hours ago   │                                │
│                                                             │
│ ┌─ Contact ─┐ ┌─ Stats ────────────┐ ┌─ Addresses ─┐    │
│ │ Email:    │ │ Total Orders: 5    │ │ Primary:    │    │
│ │ a@..com   │ │ Total Spent: ...   │ │ Jl. Merdk.. │    │
│ │ Phone:    │ │ Avg Order: ...     │ │ [Edit]      │    │
│ │ 0812...   │ │ Member Since: ...  │ │ [Add]       │    │
│ │           │ │ Last Order: 2 d    │ │             │    │
│ │           │ │ Verification: ✓    │ │             │    │
│ └───────────┘ └────────────────────┘ └─────────────┘    │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ Recent Orders (Last 5)                              │  │
│ │ [Table with order history]                          │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                             │
│ [View Order History] [View Reviews] [View Chat History]   │
│ [Reset Password] [Send Message]                           │
└────────────────────────────────────────────────────────────┘
```

---

# PAGE 13: Analytics & Reports

## Route

`/cp/analytics`

## Purpose

View detailed analytics and generate reports

## Full Page Layout

```
┌────────────────────────────────────────────────────────────┐
│ ANALYTICS & REPORTS              [Date: Jan 1-31, 2024] ▼  │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────┐  │
│ │ Revenue │ │ Orders  │ │ Avg AOV │ │ New Cust│ │ Conv││
│ │ Rp 15.2M│ │ 345     │ │ Rp 44K  │ │ 45     │ │ 2.5%││
│ │ +15%    │ │ +12%    │ │ +5%     │ │ +8%    │ │ -2% ││
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────┘  │
│                                                             │
│ ┌──────────────────────────┐  ┌──────────────────────────┐ │
│ │ Revenue Trend (30 days)  │  │ Top 10 Products          │ │
│ │ [LINE CHART]             │  │ [HORIZONTAL BAR]         │ │
│ │                          │  │                          │ │
│ └──────────────────────────┘  └──────────────────────────┘ │
│                                                             │
│ ┌──────────────────────────┐  ┌──────────────────────────┐ │
│ │ Orders Trend             │  │ Top Categories           │ │
│ │ [BAR CHART]              │  │ [PIE CHART]              │ │
│ │                          │  │                          │ │
│ └──────────────────────────┘  └──────────────────────────┘ │
│                                                             │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Detailed Report Tables                 [Export CSV]    │ │
│ │ ┌──────────────────────────────────────────────────┐  │ │
│ │ │ Hourly Sales                                     │  │ │
│ │ │ Hour │ Revenue │ Orders │ Avg │ Top Product     │  │ │
│ │ │ 08   │ Rp 500K │ 12     │ 42K │ Tahu Goreng     │  │ │
│ │ │ 09   │ Rp 750K │ 18     │ 42K │ Tempe Goreng    │  │ │
│ │ │ ... (24 hour breakdown)                         │  │ │
│ │ └──────────────────────────────────────────────────┘  │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Download Report] [Send Report Email]                      │
└────────────────────────────────────────────────────────────┘
```

## Component Breakdown

```
AnalyticsPage
├── Header
│   ├── PageTitle: "Analytics & Reports"
│   └── DateRangePicker
│       ├── Quick presets (Today, 7 days, 30 days, Year)
│       ├── Custom date range selector
│       └── [Apply] button
├── MetricsCards (5-6 key metrics)
│   ├── Total Revenue
│   ├── Total Orders
│   ├── Average Order Value
│   ├── New Customers
│   ├── Conversion Rate
│   └── Return Rate (if applicable)
├── ChartsRow1 (2 columns)
│   ├── Revenue Trend (Line Chart)
│   └── Top 10 Products (Horizontal Bar)
├── ChartsRow2 (2 columns)
│   ├── Orders Trend (Bar Chart)
│   └── Top Categories (Pie Chart)
├── DetailedReports Section
│   ├── Tabs or dropdowns to select report type
│   ├── Report Tables
│   │   ├── Hourly Sales
│   │   ├── Daily Sales
│   │   ├── Payment Method Breakdown
│   │   └── Product Performance
│   ├── Sorting & pagination per table
│   └── [Export CSV] for each table
└── ExportOptions
    ├── [Download CSV] Button
    ├── [Generate PDF] Button
    └── [Schedule Report] (option to send daily/weekly)
```

## Report Types Available

```
Tabs to switch between reports:

1. Sales Report
   - Total Revenue, Units Sold, Top Products, By Category

2. Customer Report
   - New Customers, Repeat Customers, LTV, Addresses

3. Product Report
   - Top/Bottom Products, Stock Status, Turnover Rate

4. Operational Report
   - Order Processing Time, Refund Rate, Payment Success

5. Marketing Report
   - Promo Effectiveness, CAC, ROI

User can filter by date for each report
```

---

# PAGE 14: Settings

## Route

`/cp/settings`

## Purpose

Configure store settings, integrations, and preferences

## Full Page Layout

```
┌────────────────────────────────────────────────────────────┐
│ SETTINGS                                                   │
├──────────────────┬─────────────────────────────────────────┤
│ Settings Menu    │ Content Area                            │
├──────────────────┼─────────────────────────────────────────┤
│                  │                                         │
│ ✓ Store Info     │ STORE INFORMATION                       │
│   Payment        │                                         │
│   Shipping       │ Store Name: [ATHERIS]                   │
│   Notifications  │ Logo: [Upload image]                    │
│   Staff          │ Description: [Textarea]                 │
│   Security       │ WhatsApp: [+62 812 ...]                 │
│                  │ Email: [store@email.com]                │
│                  │ Phone: [021 ...]                        │
│                  │ Address: [Textarea]                     │
│                  │                                         │
│                  │ [Save] [Cancel]                         │
│                  │                                         │
└──────────────────┴─────────────────────────────────────────┘
```

## Sidebar Navigation

```
Settings Menu (Left Sidebar):

1. ✓ Store Information
   ├── Store name, logo, description
   ├── Contact details (WhatsApp, Email, Phone)
   ├── Business address & hours
   └── Currency & language

2. Payment Integration
   ├── Payment gateway selection
   ├── API key configuration
   ├── Payment methods (COD, Bank, E-wallet)
   └── Webhook setup

3. Shipping Settings
   ├── Default shipping cost
   ├── Free shipping threshold
   ├── Processing time
   └── Shipping providers & address

4. Notification Preferences
   ├── Email notifications toggle
   ├── Push notifications toggle
   ├── Quiet hours
   └── Notification types

5. Staff Management
   ├── List of staff members
   ├── Add/remove staff
   ├── Role assignment
   └── Permission management

6. Security
   ├── Change admin password
   ├── Two-factor authentication
   ├── Login history
   └── Account recovery

7. API Keys (advanced)
   └── Generate/manage API tokens for integrations
```

## Component Breakdown for Each Section

### 1. Store Information

```
Form: StoreInfoForm
├── Store Name (required)
│   └── Validation: 3-255 characters
├── Store Logo (upload)
│   ├── Drag & drop area
│   ├── Click to browse
│   └── Preview
├── Store Description
│   ├── Textarea
│   └── Max 500 characters
├── WhatsApp Number (required)
│   ├── Format: +62 812 ...
│   └── Validation: valid phone number
├── Business Email
│   ├── Required for notifications
│   └── Validation: valid email
├── Business Phone
├── Business Address
│   ├── Textarea
│   ├── Map search
│   └── Coordinates (lat/lng)
├── Store Hours
│   ├── Monday-Friday: HH:MM - HH:MM
│   ├── Saturday: HH:MM - HH:MM
│   └── Sunday: HH:MM - HH:MM
├── Currency (Dropdown: IDR, USD, etc)
├── Language (Dropdown: ID, EN, etc)
└── [Save] [Cancel]
```

### 2. Payment Integration

```
Form: PaymentSettingsForm
├── Payment Gateway Selection
│   ├── ○ Midtrans
│   ├── ○ Xendit
│   ├── ○ Stripe
│   └── [Switch Gateway] (confirmation)
├── API Configuration
│   ├── Merchant ID (required)
│   ├── Client Key (required)
│   ├── Server Key (required, hidden)
│   ├── [Test Connection] Button
│   └── Connection Status: ✓ Connected / ✗ Failed
├── Payment Methods Enabled
│   ├── ☐ Cash on Delivery (COD)
│   ├── ☐ Bank Transfer
│   ├── ☐ E-Wallet
│   │   ├── ☐ OVO
│   │   ├── ☐ DANA
│   │   └── ☐ LinkAja
│   └── ☐ Credit Card
├── Payment Confirmation
│   ├── Manual confirmation required: ☐
│   │   └── Auto-confirm after: 24 hours
│   └── Auto-cancel unconfirmed orders: ☐
└── [Save] [Cancel]
```

### 3. Shipping Settings

```
Form: ShippingSettingsForm
├── Default Shipping Cost
│   ├── Rp [Input]
│   └── Applied if no other shipping selected
├── Free Shipping Threshold
│   ├── Rp [Input]
│   └── "Free shipping for orders above Rp X"
├── Processing Time
│   ├── [Input] hours
│   └── "Items packed within X hours"
├── Shipping Providers Integration
│   ├── JNE: ☐ Enabled
│   │   └── API Key: [hidden]
│   ├── Tiki: ☐ Enabled
│   │   └── API Key: [hidden]
│   └── Pos Indonesia: ☐ Enabled
│       └── API Key: [hidden]
├── Pickup Address
│   ├── Full Address: [Textarea]
│   ├── Phone: [Input]
│   ├── Map: [Show on map]
│   └── Coordinates: [Lat/Lng]
├── Return Shipping
│   ├── Who pays: ○ Seller ○ Buyer
│   └── Max return days: [Input]
└── [Save] [Cancel]
```

### 4. Notification Preferences

```
Form: NotificationPrefsForm
├── Email Notifications
│   ├── ☐ New Order
│   ├── ☐ Payment Received
│   ├── ☐ New Review
│   ├── ☐ New Chat Message
│   └── ☐ Daily Summary
├── Push Notifications
│   ├── ☐ Enable push notifications
│   ├── Frequency: ○ Real-time ○ Batched hourly ○ Daily
│   ├── Quiet Hours: [From time] to [To time]
│   └── Days: ☐ Mon ☐ Tue ... ☐ Sun
├── In-App Notifications
│   ├── ☐ Enable (usually always on)
│   └── Sound: ☐ Enabled
└── [Save] [Cancel]
```

### 5. Staff Management

```
Component: StaffManagementSection
├── Staff List (Table)
│   ├── Name
│   ├── Email
│   ├── Role (Admin/Moderator/Support)
│   ├── Status (Active/Inactive)
│   ├── Last Login
│   └── Actions: [Edit] [Deactivate] [Remove]
├── [+ Add New Staff] Button
│   └── Opens modal:
│       ├── Full Name (required)
│       ├── Email (required)
│       ├── Role Selection
│       │   ├── ● Admin (all permissions)
│       │   ├── ○ Moderator (reviews, users)
│       │   └── ○ Support (chat, order view-only)
│       ├── Status: ○ Active ○ Inactive
│       └── [Send Invitation] Button
│           └── Sends email with setup link
└── Permission Management (advanced)
    ├── Permission matrix per role
    ├── Checkboxes for each permission
    ├── Save permissions per role
    └── [Custom Role] option
```

### 6. Security

```
Component: SecuritySettings
├── Change Password
│   ├── Current Password: [Input, hidden]
│   ├── New Password: [Input, hidden]
│   ├── Confirm Password: [Input, hidden]
│   ├── Password strength indicator
│   └── [Change Password] Button
├── Two-Factor Authentication (2FA)
│   ├── ☐ Enable 2FA
│   │   └── Setup QR code:
│   │       ├── Show QR code
│   │       ├── App scanner
│   │       ├── Backup codes (one-time use)
│   │       └── [Confirm 2FA Code] Button
│   └── [Disable 2FA] Button (if enabled)
├── Login History
│   ├── Table: Date/Time, IP Address, Device, Location
│   ├── Recent logins only (last 20)
│   └── [Sign Out All Other Sessions] Button
└── Account Recovery
    ├── Recovery Email: [Input]
    ├── Recovery Phone: [Input]
    └── [Update] Button
```

---

## 🎯 Development Priority

```
PHASE 1 (MVP - Weeks 1-2):
├── Authentication (Login)
├── Dashboard
├── Products (List + Create/Edit)
└── Orders (List + Detail)

PHASE 2 (Core - Weeks 3-4):
├── Categories
├── Reviews
├── Banners
└── Promotions

PHASE 3 (Support - Weeks 5-6):
├── Chat
├── Users
├── Analytics (basic)
└── Settings (core sections)

PHASE 4 (Polish - Weeks 7+):
├── Advanced analytics
├── Performance optimization
├── Testing & QA
└── Documentation
```

---

**Document Version:** 1.0  
**Last Updated:** May 19, 2026  
**For:** Atheris Control Panel UI Implementation
