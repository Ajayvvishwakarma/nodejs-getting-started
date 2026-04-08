const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token

    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    req.userId = decoded._id || decoded.id || decoded.userId
    req.user._id = decoded._id || decoded.id || decoded.userId
    next()
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' })
  }
}

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' })
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied. Admin only.' })
    }

    next()
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message })
  }
}

// Middleware to check if user is customer
const isCustomer = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' })
    }

    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, error: 'Access denied. Customer access only.' })
    }

    next()
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message })
  }
}

module.exports = { verifyToken, isAdmin, isCustomer }
