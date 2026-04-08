const mongoose = require('mongoose');

const logisticsSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    
    // Key Metrics
    totalShipments: { type: Number, default: 0 },
    deliveredPackages: { type: Number, default: 0 },
    onTimeDelivery: { type: Number, default: 0 }, // percentage
    failedDeliveries: { type: Number, default: 0 },
    
    // Comparison percentages
    shipmentsChangePercent: { type: Number, default: 0 },
    deliveredChangePercent: { type: Number, default: 0 },
    onTimeChangePercent: { type: Number, default: 0 },
    failedChangePercent: { type: Number, default: 0 },
    
    // Shipping By Region
    regions: [
      {
        name: String,
        shipments: Number,
        percentage: Number
      }
    ],
    
    // Delivery Status
    deliveryStatus: [
      {
        status: String,
        count: Number,
        percentage: Number
      }
    ],
    
    // Active Shipments
    activeShipments: [
      {
        trackingId: String,
        origin: String,
        destination: String,
        status: String, // In Transit, Out for Delivery, Delivered
        weight: String,
        estimatedDate: String
      }
    ],
    
    // Top Routes
    topRoutes: [
      {
        route: String,
        shipments: Number,
        revenue: Number
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Logistics', logisticsSchema);
