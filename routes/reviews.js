const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const CustomerOrder = require('../models/CustomerOrder');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Get product reviews (public - no auth)
router.get('/product/:productId', async (req, res) => {
  try {
    const { page = 1, limit = 5, sort = 'recent' } = req.query;
    const skip = (page - 1) * limit;

    let sortObj = { createdAt: -1 };
    if (sort === 'helpful') sortObj = { helpful: -1 };
    if (sort === 'rating-high') sortObj = { rating: -1 };
    if (sort === 'rating-low') sortObj = { rating: 1 };

    const reviews = await Review.find({
      product: req.params.productId,
      status: 'approved',
      isVisible: true
    })
      .populate('customer', 'firstName lastName')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({
      product: req.params.productId,
      status: 'approved',
      isVisible: true
    });

    // Get average rating
    const ratingStats = await Review.aggregate([
      {
        $match: {
          product: require('mongodb').ObjectId(req.params.productId),
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: reviews,
      stats: ratingStats[0] || {
        avgRating: 0,
        totalReviews: 0,
        ratingDistribution: []
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add review (customer - auth required)
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { productId, orderId, rating, title, comment, images } = req.body;

    // Validate
    if (!productId || !orderId || !rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Verify customer ordered this product
    const order = await CustomerOrder.findOne({
      orderId: orderId,
      customer: req.user.id,
      'items.product': productId
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: 'You can only review products you ordered'
      });
    }

    // Check if already reviewed
    const existing = await Review.findOne({
      product: productId,
      order: orderId,
      customer: req.user.id
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already reviewed this product'
      });
    }

    const review = new Review({
      product: productId,
      customer: req.user.id,
      order: orderId,
      rating: parseInt(rating),
      title: title.trim(),
      comment: comment.trim(),
      images: images || [],
      verified: true
    });

    await review.save();

    // Update product rating
    const allReviews = await Review.find({
      product: productId,
      status: 'approved'
    });

    const avgRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    await Product.findByIdAndUpdate(
      productId,
      { rating: avgRating, reviewCount: allReviews.length }
    );

    res.status(201).json({
      success: true,
      message: 'Review submitted for moderation',
      data: review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update review (customer - only if pending)
router.put('/:reviewId', verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review || review.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (review.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only edit pending reviews'
      });
    }

    const { rating, title, comment, images } = req.body;

    Object.assign(review, {
      rating: rating || review.rating,
      title: title || review.title,
      comment: comment || review.comment,
      images: images || review.images
    });

    await review.save();

    res.json({
      success: true,
      message: 'Review updated',
      data: review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete review (customer only their own)
router.delete('/:reviewId', verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review || review.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await Review.findByIdAndDelete(req.params.reviewId);

    res.json({
      success: true,
      message: 'Review deleted'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark review as helpful
router.post('/:reviewId/helpful', async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.helpful += 1;
    await review.save();

    res.json({
      success: true,
      message: 'Thanks for your feedback',
      data: { helpful: review.helpful }
    });
  } catch (error) {
    console.error('Helpful error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Get pending reviews
router.get('/admin/pending', verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ status: 'pending' })
      .populate('product', 'name')
      .populate('customer', 'firstName lastName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: 1 });

    const total = await Review.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Approve review
router.post('/admin/:reviewId/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { status: 'approved' },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Review approved',
      data: review
    });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Reject review
router.post('/admin/:reviewId/reject', verifyToken, isAdmin, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { status: 'rejected' },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Review rejected',
      data: review
    });
  } catch (error) {
    console.error('Reject review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Add response to review
router.post('/admin/:reviewId/respond', verifyToken, isAdmin, async (req, res) => {
  try {
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Response text required'
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      {
        adminResponse: {
          text: response,
          respondedAt: new Date(),
          respondedBy: req.user.id
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Response added',
      data: review
    });
  } catch (error) {
    console.error('Respond to review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
