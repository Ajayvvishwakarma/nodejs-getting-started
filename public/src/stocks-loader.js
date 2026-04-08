// Stocks Data Loader
async function loadStocksData() {
  try {
    const response = await fetch('/api/dashboard/stocks', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      console.error('Failed to fetch stocks data:', response.status)
      return
    }

    const { data } = await response.json()

    // Update Portfolio Value
    const portfolioElement = document.querySelector('[data-stocks-portfolio]')
    if (portfolioElement && data.portfolio) {
      const portfolioValue = data.portfolio.reduce((sum, stock) => 
        sum + (stock.price * (stock.change ? 1 : 0)), 
        0
      )
      portfolioElement.textContent = `$${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    }

    // Update Performance Metrics
    if (data.performanceMonthly) {
      const monthlyEl = document.querySelector('[data-month-perf]')
      if (monthlyEl) monthlyEl.textContent = `${data.performanceMonthly}%`
    }
    if (data.performanceQuarterly) {
      const quarterlyEl = document.querySelector('[data-quarterly-perf]')
      if (quarterlyEl) quarterlyEl.textContent = `${data.performanceQuarterly}%`
    }
    if (data.performanceAnnually) {
      const annuallyEl = document.querySelector('[data-annual-perf]')
      if (annuallyEl) annuallyEl.textContent = `${data.performanceAnnually}%`
    }

    // Update Portfolio Table
    if (data.portfolio && data.portfolio.length > 0) {
      const portfolioTable = document.querySelector('[data-portfolio-table]')
      if (portfolioTable) {
        portfolioTable.innerHTML = data.portfolio.map(stock => `
          <tr>
            <td>${stock.symbol}</td>
            <td>${stock.company}</td>
            <td>$${stock.price.toFixed(2)}</td>
            <td class="${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}">
              ${stock.change >= 0 ? '+' : ''}${stock.change}%
            </td>
          </tr>
        `).join('')
      }
    }

    // Update Trending Table
    if (data.trending && data.trending.length > 0) {
      const trendingTable = document.querySelector('[data-trending-table]')
      if (trendingTable) {
        trendingTable.innerHTML = data.trending.map(stock => `
          <tr>
            <td>${stock.symbol}</td>
            <td>${stock.company}</td>
            <td>$${stock.price.toFixed(2)}</td>
            <td class="${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}">
              ${stock.change >= 0 ? '+' : ''}${stock.change}%
            </td>
            <td><span class="badge ${stock.status === 'Buy Stock' ? 'badge-success' : 'badge-warning'}">${stock.status}</span></td>
          </tr>
        `).join('')
      }
    }

    // Update Watchlist Table
    if (data.watchlist && data.watchlist.length > 0) {
      const watchlistTable = document.querySelector('[data-watchlist-table]')
      if (watchlistTable) {
        watchlistTable.innerHTML = data.watchlist.slice(0, 5).map(stock => `
          <tr>
            <td>${stock.symbol}</td>
            <td>${stock.company}</td>
            <td>$${stock.price.toFixed(2)}</td>
            <td class="${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}">
              ${stock.change >= 0 ? '+' : ''}${stock.change}%
            </td>
          </tr>
        `).join('')
      }
    }

    // Update Recent Transactions
    if (data.transactions && data.transactions.length > 0) {
      const transactionsTable = document.querySelector('[data-transactions-table]')
      if (transactionsTable) {
        transactionsTable.innerHTML = data.transactions.map(trans => `
          <tr>
            <td>${trans.action}</td>
            <td>${trans.symbol}</td>
            <td>${trans.date}</td>
            <td>$${trans.price.toFixed(2)}</td>
            <td><span class="badge ${trans.status === 'Success' ? 'badge-success' : trans.status === 'Pending' ? 'badge-warning' : 'badge-danger'}">${trans.status}</span></td>
          </tr>
        `).join('')
      }
    }

    console.log('✅ Stocks data loaded successfully')
  } catch (error) {
    console.error('❌ Error loading stocks data:', error)
  }
}

// Load data on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadStocksData)
} else {
  loadStocksData()
}

// Auto-refresh every 5 minutes
setInterval(loadStocksData, 5 * 60 * 1000)
