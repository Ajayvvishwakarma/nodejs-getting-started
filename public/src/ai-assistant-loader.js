// AI Assistant Data Loader
async function loadAIAssistantData() {
  try {
    const response = await fetch('/api/dashboard/ai-assistant', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      console.error('Failed to fetch AI Assistant data:', response.status)
      return
    }

    const { data } = await response.json()

    // Update Total Requests Card
    const requestsEl = document.querySelector('[data-ai-requests]')
    if (requestsEl) {
      const requests = data.totalRequests || 0
      requestsEl.textContent = (requests / 1000).toFixed(1) + 'K'
    }

    // Update Tokens Used Card
    const tokensEl = document.querySelector('[data-ai-tokens]')
    if (tokensEl) {
      const tokens = data.tokensUsed || 0
      tokensEl.textContent = (tokens / 1000000).toFixed(2) + 'M'
    }

    // Update Active Users Card
    const usersEl = document.querySelector('[data-ai-users]')
    if (usersEl) {
      const users = data.activeUsers || 0
      usersEl.textContent = users.toString()
    }

    // Update API Calls Card
    const callsEl = document.querySelector('[data-ai-calls]')
    if (callsEl) {
      const calls = data.apiCalls || 0
      callsEl.textContent = (calls / 1000).toFixed(1) + 'K'
    }

    // Update Uptime Card
    const uptimeEl = document.querySelector('[data-ai-uptime]')
    if (uptimeEl) {
      const uptime = data.uptime || 0
      uptimeEl.textContent = uptime.toFixed(2) + '%'
    }

    // Update Error Count
    const errorsEl = document.querySelector('[data-ai-errors]')
    if (errorsEl) {
      const errors = data.errors || 0
      errorsEl.textContent = errors.toString()
    }

    // Update Tools Usage Breakdown
    if (data.toolsUsage && data.toolsUsage.length > 0) {
      const toolsContainer = document.querySelector('[data-tools-usage]')
      if (toolsContainer) {
        const maxUsage = Math.max(...data.toolsUsage.map(t => t.usageCount))
        toolsContainer.innerHTML = data.toolsUsage.map(tool => `
          <div class="tool-item">
            <div class="tool-header">
              <span class="tool-name">${tool.tool}</span>
              <span class="tool-count">${tool.usageCount}</span>
            </div>
            <div class="tool-stats">
              <span class="tokens">Tokens: ${(tool.tokensConsumed / 1000).toFixed(1)}K</span>
              <span class="response-time">Avg: ${tool.averageResponseTime}s</span>
            </div>
            <div class="tool-progress">
              <div class="progress-bar" style="width: ${(tool.usageCount / maxUsage) * 100}%"></div>
            </div>
          </div>
        `).join('')
      }
    }

    // Update Recent Generations List
    if (data.recentGenerations && data.recentGenerations.length > 0) {
      const generationsTable = document.querySelector('[data-generations-table]')
      if (generationsTable) {
        generationsTable.innerHTML = data.recentGenerations.map(gen => `
          <tr>
            <td>${new Date(gen.timestamp).toLocaleString()}</td>
            <td><span class="badge badge-info">${gen.tool}</span></td>
            <td>${gen.user}</td>
            <td class="prompt-text">${gen.prompt.substring(0, 50)}...</td>
            <td>${gen.tokensUsed || 'N/A'}</td>
            <td><span class="badge ${gen.status === 'completed' ? 'badge-success' : 'badge-warning'}">${gen.status}</span></td>
          </tr>
        `).join('')
      }
    }

    // Update Response Time
    const responseTimeEl = document.querySelector('[data-response-time]')
    if (responseTimeEl && data.averageResponseTime) {
      responseTimeEl.textContent = data.averageResponseTime.toFixed(2) + 's'
    }

    console.log('✅ AI Assistant data loaded successfully')
  } catch (error) {
    console.error('❌ Error loading AI Assistant data:', error)
  }
}

// Load data on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAIAssistantData)
} else {
  loadAIAssistantData()
}

// Auto-refresh every 5 minutes
setInterval(loadAIAssistantData, 5 * 60 * 1000)
