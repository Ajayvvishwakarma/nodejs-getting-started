// SaaS Data Loader
async function loadSaaSData() {
  try {
    const response = await fetch('/api/dashboard/saas', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      console.error('Failed to fetch SaaS data:', response.status)
      return
    }

    const { data } = await response.json()

    // Update Revenue Card
    const revenueEl = document.querySelector('[data-saas-revenue]')
    if (revenueEl) {
      const revenue = data.totalRevenue || 0
      revenueEl.textContent = `$${(revenue / 1000).toFixed(1)}K`
    }

    const revenueChangeEl = document.querySelector('[data-revenue-change]')
    if (revenueChangeEl && data.revenueChange) {
      revenueChangeEl.textContent = `${data.revenueChange >= 0 ? '+' : ''}${data.revenueChange}%`
      revenueChangeEl.className = data.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'
    }

    // Update Subscribers Card
    const subscribersEl = document.querySelector('[data-saas-subscribers]')
    if (subscribersEl) {
      const subscribers = data.activeSubscribers || 0
      subscribersEl.textContent = subscribers.toLocaleString()
    }

    const subscriberChangeEl = document.querySelector('[data-subscriber-change]')
    if (subscriberChangeEl && data.subscriberChange) {
      subscriberChangeEl.textContent = `${data.subscriberChange >= 0 ? '+' : ''}${data.subscriberChange}%`
      subscriberChangeEl.className = data.subscriberChange >= 0 ? 'text-green-500' : 'text-red-500'
    }

    // Update Churn Rate Card
    const churnEl = document.querySelector('[data-saas-churn]')
    if (churnEl) {
      const churn = data.churnRate || 0
      churnEl.textContent = `${churn}%`
    }

    const churnChangeEl = document.querySelector('[data-churn-change]')
    if (churnChangeEl && data.churnChange) {
      churnChangeEl.textContent = `${data.churnChange >= 0 ? '+' : ''}${data.churnChange}%`
      churnChangeEl.className = data.churnChange >= 0 ? 'text-red-500' : 'text-green-500'
    }

    // Update MRR Card
    const mrrEl = document.querySelector('[data-saas-mrr]')
    if (mrrEl) {
      const mrr = data.monthlyRecurringRevenue || 0
      mrrEl.textContent = `$${mrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    }

    // Update Plans Breakdown
    if (data.plans && data.plans.length > 0) {
      const plansContainer = document.querySelector('[data-plans-breakdown]')
      if (plansContainer) {
        plansContainer.innerHTML = data.plans.map(plan => `
          <div class="plan-item">
            <div class="plan-name">${plan.name}</div>
            <div class="plan-price">$${plan.price}</div>
            <div class="plan-subscribers">${plan.subscribers} subscribers</div>
            <div class="plan-progress">
              <div class="progress-bar" style="width: ${(plan.subscribers / Math.max(...data.plans.map(p => p.subscribers))) * 100}%"></div>
            </div>
          </div>
        `).join('')
      }
    }

    // Update Segments
    if (data.segments && data.segments.length > 0) {
      const segmentsTable = document.querySelector('[data-segments-table]')
      if (segmentsTable) {
        segmentsTable.innerHTML = data.segments.map(segment => `
          <tr>
            <td>${segment.name}</td>
            <td>${segment.count}</td>
            <td>$${segment.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td class="${segment.growth >= 0 ? 'text-green-500' : 'text-red-500'}">
              ${segment.growth >= 0 ? '+' : ''}${segment.growth}%
            </td>
          </tr>
        `).join('')
      }
    }

    // Update Revenue Breakdown Chart Data
    if (data.revenueBreakdown && data.revenueBreakdown.length > 0) {
      const revenueBreakdownEl = document.querySelector('[data-revenue-breakdown]')
      if (revenueBreakdownEl) {
        revenueBreakdownEl.innerHTML = data.revenueBreakdown.map(item => `
          <div class="breakdown-item">
            <span>${item.month}</span>
            <span>$${item.amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
          </div>
        `).join('')
      }
    }

    // Update Recent Transactions
    if (data.transactions && data.transactions.length > 0) {
      const transactionsTable = document.querySelector('[data-saas-transactions]')
      if (transactionsTable) {
        transactionsTable.innerHTML = data.transactions.map(trans => `
          <tr>
            <td>${new Date(trans.date).toLocaleDateString()}</td>
            <td>$${trans.amount.toFixed(2)}</td>
            <td>${trans.plan}</td>
            <td>${trans.customer}</td>
            <td><span class="badge badge-success">${trans.status}</span></td>
          </tr>
        `).join('')
      }
    }

    console.log('✅ SaaS data loaded successfully')
  } catch (error) {
    console.error('❌ Error loading SaaS data:', error)
  }
}

// Load data on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSaaSData)
} else {
  loadSaaSData()
}

// Auto-refresh every 5 minutes
setInterval(loadSaaSData, 5 * 60 * 1000)
