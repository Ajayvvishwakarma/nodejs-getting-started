// Logistics Data Loader
async function loadLogisticsData() {
  try {
    const response = await fetch('/api/dashboard/logistics', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      console.error('Failed to fetch logistics data:', response.status)
      return
    }

    const { data } = await response.json()

    // Update Total Shipments Card
    const shipmentsEl = document.querySelector('[data-logistics-shipments]')
    if (shipmentsEl) {
      const shipments = data.totalShipments || 0
      shipmentsEl.textContent = shipments.toLocaleString()
    }

    const shipmentsChangeEl = document.querySelector('[data-shipments-change]')
    if (shipmentsChangeEl && data.shipmentsChange) {
      shipmentsChangeEl.textContent = `${data.shipmentsChange >= 0 ? '+' : ''}${data.shipmentsChange}%`
      shipmentsChangeEl.className = data.shipmentsChange >= 0 ? 'text-green-500' : 'text-red-500'
    }

    // Update Delivered Packages Card
    const deliveredEl = document.querySelector('[data-logistics-delivered]')
    if (deliveredEl) {
      const delivered = data.deliveredPackages || 0
      deliveredEl.textContent = delivered.toLocaleString()
    }

    const deliveredChangeEl = document.querySelector('[data-delivered-change]')
    if (deliveredChangeEl && data.deliveredChange) {
      deliveredChangeEl.textContent = `${data.deliveredChange >= 0 ? '+' : ''}${data.deliveredChange}%`
      deliveredChangeEl.className = data.deliveredChange >= 0 ? 'text-green-500' : 'text-red-500'
    }

    // Update Active Shipments Count
    const activeEl = document.querySelector('[data-logistics-active]')
    if (activeEl && Array.isArray(data.activeShipments)) {
      activeEl.textContent = data.activeShipments.length.toString()
    }

    // Update Delivery Status Breakdown
    if (data.deliveryStatus && data.deliveryStatus.length > 0) {
      const statusContainer = document.querySelector('[data-delivery-status]')
      if (statusContainer) {
        statusContainer.innerHTML = data.deliveryStatus.map(status => `
          <div class="status-item">
            <div class="status-name">${status.status}</div>
            <div class="status-count">${status.count}</div>
            <div class="status-percentage">${status.percentage}%</div>
          </div>
        `).join('')
      }
    }

    // Update Regions Table
    if (data.regions && data.regions.length > 0) {
      const regionsTable = document.querySelector('[data-regions-table]')
      if (regionsTable) {
        regionsTable.innerHTML = data.regions.map(region => `
          <tr>
            <td>${region.name}</td>
            <td>${region.shipments}</td>
            <td>${region.delivered}</td>
            <td>${region.pending}</td>
            <td><span class="badge badge-danger">${region.delayed}</span></td>
          </tr>
        `).join('')
      }
    }

    // Update Top Routes
    if (data.topRoutes && data.topRoutes.length > 0) {
      const routesTable = document.querySelector('[data-routes-table]')
      if (routesTable) {
        routesTable.innerHTML = data.topRoutes.map(route => `
          <tr>
            <td>${route.route}</td>
            <td>${route.shipments}</td>
            <td>${route.avgDeliveryTime} days</td>
            <td><span class="badge badge-success">${route.onTimePercentage}%</span></td>
          </tr>
        `).join('')
      }
    }

    // Update Active Shipments List
    if (data.activeShipments && data.activeShipments.length > 0) {
      const activeShipmentsEl = document.querySelector('[data-active-shipments-list]')
      if (activeShipmentsEl) {
        activeShipmentsEl.innerHTML = data.activeShipments.map(shipment => `
          <div class="shipment-item">
            <div class="shipment-header">
              <span class="shipment-tracking">${shipment.trackingNumber}</span>
              <span class="shipment-carrier">${shipment.carrier}</span>
            </div>
            <div class="shipment-route">${shipment.origin} → ${shipment.destination}</div>
            <div class="shipment-status">
              <span class="badge badge-info">${shipment.status}</span>
            </div>
            <div class="shipment-progress">
              <div class="progress-bar" style="width: ${shipment.progress}%"></div>
              <span>${shipment.progress}%</span>
            </div>
            <div class="shipment-delivery">
              Est. Delivery: ${new Date(shipment.estimatedDelivery).toLocaleDateString()}
            </div>
          </div>
        `).join('')
      }
    }

    console.log('✅ Logistics data loaded successfully')
  } catch (error) {
    console.error('❌ Error loading logistics data:', error)
  }
}

// Load data on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadLogisticsData)
} else {
  loadLogisticsData()
}

// Auto-refresh every 5 minutes
setInterval(loadLogisticsData, 5 * 60 * 1000)
