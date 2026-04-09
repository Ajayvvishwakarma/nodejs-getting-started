# 🚀 CMS System - Complete Guide

## What is CMS?

CMS = **Content Management System** - Allows admin to manage store content without coding!

---

## 📊 System Overview

### New Files Created:

1. **Models**
   - `models/Banner.js` - Slider banners
   - `models/Category.js` - Product categories

2. **API Routes**
   - `routes/cms.js` - Complete CRUD API for Banners, Categories, Products

3. **Admin Panel**
   - `public/cms-panel.html` - Web interface for management

4. **Utils**
   - `create-cms-data.js` - Seed test data

---

## 🎯 Features

### 1. Banners / Sliders
```
✅ Add multiple banners for homepage slider
✅ Upload custom images
✅ Edit title, subtitle, button text
✅ Set display order
✅ Toggle active/inactive
✅ Delete banners
```

### 2. Categories
```
✅ Create product categories
✅ Upload category images
✅ Add descriptions
✅ Manage active status
✅ Edit/Delete categories
```

### 3. Products
```
✅ Add products with details
✅ Upload product images
✅ Set prices (current & original)
✅ Manage stock
✅ Assign categories & brands
✅ Edit/Delete products
```

### 4. Image Upload
```
✅ Direct image uploads
✅ Automatic file management
✅ Images saved to: /public/uploads/
✅ Returns image URL for use
```

---

## 📡 API Endpoints

### Banners API

```bash
# Get all active banners (public)
GET /api/cms/banners

# Get all banners including inactive (admin only)
GET /api/cms/banners/admin/all
Headers: Authorization: Bearer YOUR_TOKEN

# Create banner (admin only)
POST /api/cms/banners
Headers: Authorization: Bearer YOUR_TOKEN
Body: {
  "title": "Glamorous",
  "subtitle": "New Collection",
  "image": "/uploads/banner-1.jpg",
  "buttonText": "Shop Now",
  "buttonLink": "/products",
  "isActive": true
}

# Update banner (admin only)
PUT /api/cms/banners/:id
Headers: Authorization: Bearer YOUR_TOKEN
Body: {same as create}

# Delete banner (admin only)
DELETE /api/cms/banners/:id
Headers: Authorization: Bearer YOUR_TOKEN
```

### Categories API

```bash
# Get all active categories (public)
GET /api/cms/categories

# Get all categories including inactive (admin only)
GET /api/cms/categories/admin/all
Headers: Authorization: Bearer YOUR_TOKEN

# Create category (admin only)
POST /api/cms/categories
Headers: Authorization: Bearer YOUR_TOKEN
Body: {
  "name": "Clothing",
  "description": "All clothing items",
  "image": "/uploads/category-clothing.jpg"
}

# Update category (admin only)
PUT /api/cms/categories/:id
Headers: Authorization: Bearer YOUR_TOKEN

# Delete category (admin only)
DELETE /api/cms/categories/:id
Headers: Authorization: Bearer YOUR_TOKEN
```

### Products API

```bash
# Get all products with pagination
GET /api/cms/products-cms?page=1&limit=20&category=clothing&search=shirt

# Create product (admin only)
POST /api/cms/products-cms
Headers: Authorization: Bearer YOUR_TOKEN
Body: {
  "name": "Ribbed Tank Top",
  "description": "...",
  "price": 16.95,
  "originalPrice": 25.00,
  "category": "Clothing",
  "brand": "Premium",
  "image": "/uploads/product-1.jpg",
  "stock": 100,
  "sku": "SKU-001"
}

# Update product (admin only)
PUT /api/cms/products-cms/:id
Headers: Authorization: Bearer YOUR_TOKEN

# Delete product (admin only)
DELETE /api/cms/products-cms/:id
Headers: Authorization: Bearer YOUR_TOKEN
```

### Image Upload API

```bash
# Upload image (admin only)
POST /api/cms/upload
Headers: Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

Form Data:
  - image: <file>

Response:
{
  "success": true,
  "image": "/uploads/1234567890-imagename.jpg",
  "filename": "1234567890-imagename.jpg"
}
```

---

## 🏃 Quick Start

### Step 1: Install Dependencies (if needed)
```bash
npm install multer --save
```

✅ Already installed!

### Step 2: Seed Test Data
```bash
cd nodejs-getting-started
node create-cms-data.js
```

Expected output:
```
✓ MongoDB connected
✓ Banners created: 3
✓ Categories created: 5
```

### Step 3: Start Server
```bash
npm start
# or
node index.js
```

### Step 4: Access Admin Panel
```
http://localhost:5006/cms-panel.html
```

---

## 🎨 Using the Admin Panel

### To Add a Banner:
1. Go to Admin Panel → Banners tab
2. Click "+ Add Banner"
3. Fill in title, subtitle
4. Upload image
5. Set button text & link
6. Click "Save Banner"

### To Add Category:
1. Go to Admin Panel → Categories tab
2. Click "+ Add Category"
3. Name & describe it
4. Upload category image
5. Click "Save Category"

### To Add Product:
1. Go to Admin Panel → Products tab
2. Click "+ Add Product"
3. Fill all fields
4. Upload product image
5. Select category
6. Click "Save Product"

---

## 🌐 Frontend Integration

### Using Banners (React/JavaScript)

```javascript
// Fetch and display banners
async function loadBanners() {
  const response = await fetch('/api/cms/banners');
  const banners = await response.json();
  
  // Display in slider
  banners.forEach(banner => {
    console.log(banner.title, banner.image);
  });
}
```

### Using Categories

```javascript
async function loadCategories() {
  const response = await fetch('/api/cms/categories');
  const categories = await response.json();
  
  // Display in grid
  categories.forEach(cat => {
    console.log(cat.name, cat.image);
  });
}
```

### Using Products

```javascript
async function loadProducts() {
  const response = await fetch('/api/cms/products-cms?category=Clothing');
  const data = await response.json();
  
  // Display products
  data.products.forEach(product => {
    console.log(product.name, product.price, product.image);
  });
}
```

---

## 📂 File Structure

```
nodejs-getting-started/
├── models/
│   ├── Banner.js (NEW)
│   ├── Category.js (NEW)
│   └── Product.js (exists)
├── routes/
│   └── cms.js (NEW)
├── public/
│   ├── cms-panel.html (NEW)
│   └── uploads/ (image storage)
├── create-cms-data.js (NEW)
└── index.js (UPDATED - added CMS route)
```

---

## 🔐 Security Notes

- All admin endpoints require authentication token
- Token should be in localStorage after login
- Only admins can create/edit/delete
- Public can view active content

---

## 🐛 Troubleshooting

### Issue: Image upload fails
**Solution**: Check if `/public/uploads` folder exists. Should be auto-created.

### Issue: "No token provided"
**Solution**: Login first, token is saved in localStorage

### Issue: 404 on /api/cms
**Solution**: Make sure CMS route is added in index.js (already done)

---

## 📱 Next Steps

1. ✅ Models created
2. ✅ API routes created
3. ✅ Admin panel created
4. ⏭️ Make homepage dynamic (fetch banners/categories)
5. ⏭️ Make products page dynamic
6. ⏭️ Add React hooks for real-time updates

---

## 💡 Examples

### Complete Flow

1. **Admin Creates Banner**
   ```
   Admin Panel → Upload image → Set title → Save
   ↓
   API creates document in MongoDB
   ↓
   Image stored in /uploads/
   ↓
   URL returned: /uploads/banner-1.jpg
   ```

2. **Website Fetches Banner**
   ```
   Homepage loads
   ↓
   fetch('/api/cms/banners')
   ↓
   Display in slider
   ```

---

## 🎯 Database Schema

### Banner
```javascript
{
  _id: ObjectId,
  title: String,
  subtitle: String,
  image: String,        // URL to uploaded image
  buttonText: String,
  buttonLink: String,
  order: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Category
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  image: String,        // URL to uploaded image
  slug: String,         // auto-generated from name
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Product (Enhanced)
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  originalPrice: Number,
  category: String,
  brand: String,
  image: String,        // Main image
  images: [String],     // Multiple images
  stock: Number,
  sku: String,
  // ... other fields
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Ready to Deploy!

Your CMS is ready. You now have:
- ✅ Fully functional admin panel
- ✅ Image upload system  
- ✅ CRUD API for all content
- ✅ Database integration

**Total time**: ~30 minutes to set up
**Complexity**: Medium
**Scalability**: Very good

Enjoy your dynamic CMS! 🎉
