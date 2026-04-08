const express = require('express')
const path = require('path')
const cors = require('cors')
const connectDB = require('./config/db')
require('dotenv').config()

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
