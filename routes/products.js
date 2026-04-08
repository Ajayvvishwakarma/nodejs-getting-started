const express = require('express')
const router = express.Router()
const Product = require('../models/Product')

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, isActive, isFeatured } = req.query
    const filter = {}

    if (category) filter.category = category
    if (isActive !== undefined) filter.isActive = isActive === 'true'
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true'

    const products = await Product.find(filter)
    res.json({
      success: true,
      count: products.length,
      data: products,
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }
    res.json({ success: true, data: product })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Create product
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body)
    await product.save()
    res.status(201).json({ success: true, data: product })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// Update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }
    res.json({ success: true, data: product })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }
    res.json({ success: true, message: 'Product deleted', data: product })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
