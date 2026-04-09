const express = require('express')
const path = require('path')
const cors = require('cors')

// Load environment variables FIRST - with explicit path
require('dotenv').config({ path: path.join(__dirname, '.env') })

const connectDB = require('./config/db')

const port = process.env.PORT || 5006

const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

// Serve ecomus as static website for customers
app.use('/ecomus', express.static(path.join(__dirname, '../themesflat.co/html/ecomus')))

// Serve sibforms.com
app.use('/sibforms.com', express.static(path.join(__dirname, '../sibforms.com')))

// Serve static brevo images
app.use('/static.brevo.com', express.static(path.join(__dirname, '../static.brevo.com')))

// Placeholder SVG for missing images
const placeholderSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect fill="#8B5CF6" width="128" height="128"/>
  <circle cx="64" cy="40" r="20" fill="#ffffff"/>
  <path d="M 40 80 Q 40 65 64 65 Q 88 65 88 80 L 88 100 Q 88 110 80 115 L 48 115 Q 40 110 40 100 Z" fill="#ffffff"/>
</svg>`;

// Truck image placeholder
const truckSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120">
  <rect fill="#E5E7EB" width="200" height="120" rx="8"/>
  <rect x="20" y="40" width="80" height="50" fill="#F59E0B" rx="4"/>
  <rect x="100" y="45" width="70" height="40" fill="#3B82F6" rx="4"/>
  <circle cx="40" cy="100" r="12" fill="#1F2937"/>
  <circle cx="160" cy="100" r="12" fill="#1F2937"/>
</svg>`;

// Avatar placeholder
const avatarSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
  <rect fill="#10B981" width="80" height="80" rx="50"/>
  <circle cx="40" cy="28" r="12" fill="#ffffff"/>
  <path d="M 20 55 Q 20 42 40 42 Q 60 42 60 55 L 60 70 Q 60 76 54 78 L 26 78 Q 20 76 20 70 Z" fill="#ffffff"/>
</svg>`;

// Handle missing images - return appropriate placeholder SVG
app.get('/admin-dashboard/src/images/user/:filename', (req, res) => {
  res.set('Content-Type', 'image/svg+xml');
  res.send(placeholderSVG);
});

app.get('/admin-dashboard/src/images/logistics/:filename', (req, res) => {
  res.set('Content-Type', 'image/svg+xml');
  const filename = req.params.filename.toLowerCase();
  if (filename.includes('truck') || filename.includes('delivery') || filename.includes('vehicle')) {
    res.send(truckSVG);
  } else if (filename.includes('avatar')) {
    res.send(avatarSVG);
  } else {
    res.send(placeholderSVG);
  }
});

app.get('/admin-dashboard/src/images/:category/:filename', (req, res) => {
  res.set('Content-Type', 'image/svg+xml');
  res.send(placeholderSVG);
});

// Serve admin dashboard for admins
app.use('/admin-dashboard', express.static(path.join(__dirname, '../test01/demo.tailadmin.com')))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Routes
app.get('/', (req, res) => {
  res.redirect('/ecomus/index.html')
})

// Auth Pages
app.get('/login', (req, res) => {
  res.render('pages/login')
})

app.get('/register', (req, res) => {
  res.render('pages/register')
})

// Middleware
const { verifyToken, isAdmin, isCustomer } = require('./middleware/auth')

// Dashboard Routes - Role-based access (frontend checks role)
app.get('/dashboard', (req, res) => {
  res.render('pages/index')
})

// Admin Panel - Frontend checks role in localStorage
app.get('/admin/panel', (req, res) => {
  res.render('pages/admin-dashboard')
})

// API Routes
const { router: authRouter } = require('./routes/auth')
app.use('/api/products', require('./routes/products'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/auth', authRouter)
app.use('/api/dashboard', require('./routes/dashboard'))
app.use('/api/chat', require('./routes/chat'))
app.use('/api/payment-methods', require('./routes/paymentMethods'))
app.use('/api/image-gallery', require('./routes/imageGallery'))
app.use('/api/modules', require('./routes/moduleManagement'))
app.use('/api/images', require('./routes/images'))
app.use('/api/billing', require('./routes/billing'))

// Customer Store Routes
const { router: customerRouter } = require('./routes/customers')
app.use('/api/customers', customerRouter)
app.use('/api/store', require('./routes/store'))
app.use('/api/cart', require('./routes/cart'))
app.use('/api/checkout', require('./routes/checkout'))
app.use('/api/payment', require('./routes/payments'))

// Enhanced Features
app.use('/api/discounts', require('./routes/discounts'))
app.use('/api/reviews', require('./routes/reviews'))
app.use('/api/admin/orders', require('./routes/adminOrders'))

// Email Management Routes
app.use('/api/emails', require('./routes/emails'))

// CMS Routes (Banners, Categories, Products Management)
app.use('/api/cms', require('./routes/cms'))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' })
})

// Suppress /cdn-cgi/rum monitoring requests (return 204 success)
app.post('/cdn-cgi/rum', (req, res) => {
  res.status(204).send()
})

const server = app.listen(port, () => {
  console.log(`Listening on ${port}`)
})

// The number of seconds an idle Keep-Alive connection is kept open. This should be greater than the Heroku Router's
// Keep-Alive idle timeout of 90 seconds:
// - to ensure that the closing of idle connections is always initiated by the router and not the Node.js server
// - to prevent a race condition if the router sends a request to the app just as Node.js is closing the connection
// https://devcenter.heroku.com/articles/http-routing#keepalives
// https://nodejs.org/api/http.html#serverkeepalivetimeout
server.keepAliveTimeout = 95 * 1000

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: gracefully shutting down')
  if (server) {
    server.close(() => {
      console.log('HTTP server closed')
    })
  }
})
