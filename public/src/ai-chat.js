// Real-Time Chat Handler for AI Generators
class AIChat {
  constructor(generatorType) {
    this.generatorType = generatorType
    this.messages = []
    this.init()
  }

  async init() {
    console.log('🚀 Initializing AIChat for generator type:', this.generatorType)
    
    // Load existing messages
    await this.loadMessages()
    
    // Setup event listeners
    this.setupListeners()
    
    // Auto-refresh messages every 3 seconds
    setInterval(() => this.checkForNewMessages(), 3000)
    
    console.log('✅ AIChat fully initialized')
  }

  setupListeners() {
    // Find textarea and buttons
    const textarea = document.querySelector('textarea')
    const sendBtn = this.findSendButton()
    const attachBtn = this.findAttachButton()
    
    if (!textarea || !sendBtn) {
      console.error('Chat elements not found')
      return
    }

    // Send message on button click
    sendBtn.addEventListener('click', () => this.sendMessage(textarea))

    // Send on Ctrl/Cmd + Enter
    textarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        this.sendMessage(textarea)
      }
    })

    // Handle file attachment
    if (attachBtn) {
      attachBtn.addEventListener('click', () => this.triggerFileUpload())
    }
  }

  clearChat() {
    // Clear all messages from UI
    const containers = document.querySelectorAll('.custom-scrollbar, [class*="overflow-y-auto"]')
    if (containers.length > 0) {
      containers[0].innerHTML = ''
    }

    // Clear textarea
    const textarea = document.querySelector('textarea')
    if (textarea) {
      textarea.value = ''
      textarea.style.height = 'auto'
    }

    // Clear file input
    const fileInput = document.getElementById('chat-file-input')
    if (fileInput) {
      fileInput.value = ''
    }

    // Reset messages array
    this.messages = []

    // Log success
    console.log('✅ Chat cleared - Ready for new conversation')
  }

  findSendButton() {
    // Strategy 1: Find button in the input area using better selector
    const inputArea = document.querySelector('[class*="flex"][class*="gap"]')
    if (inputArea) {
      const buttons = inputArea.querySelectorAll('button')
      if (buttons.length > 0) {
        const sendBtn = buttons[buttons.length - 1] // Last button is usually send
        console.log('✅ Send button found via input area')
        return sendBtn
      }
    }

    // Strategy 2: Find by SVG path patterns for send icon
    const allButtons = Array.from(document.querySelectorAll('button'))
    const sendBtn = allButtons.find(btn => {
      const svg = btn.querySelector('svg')
      if (!svg) return false
      const path = svg.querySelector('path')
      // Look for typical send arrow patterns
      return (
        btn.innerHTML.includes('M9.99674') ||
        btn.innerHTML.includes('M10') && btn.innerHTML.includes('stroke') ||
        btn.classList.contains('bg-gray-900') ||
        btn.classList.contains('hover:bg-gray-800')
      )
    })
    
    if (sendBtn) {
      console.log('✅ Send button found via SVG pattern')
      return sendBtn
    }

    // Strategy 3: Last button overall (as last resort)
    if (allButtons.length > 0) {
      console.log('✅ Send button found as last button')
      return allButtons[allButtons.length - 1]
    }

    console.error('❌ Send button not found')
    return null
  }

  findAttachButton() {
    const buttons = document.querySelectorAll('button')
    return Array.from(buttons).find(btn => 
      btn.textContent.includes('Attach') ||
      btn.innerHTML.includes('d="M14.4194')
    )
  }

  async sendMessage(textarea) {
    // If textarea not provided, find it
    if (!textarea) {
      textarea = document.querySelector('textarea')
    }

    if (!textarea) {
      console.error('❌ Textarea not found')
      alert('Chat input not found')
      return
    }

    const message = textarea.value.trim()
    
    console.log('📝 Message value:', message, 'Length:', message.length)
    console.log('🎯 Current generator type:', this.generatorType)
    
    if (!message || message.length === 0) {
      console.warn('⚠️ Empty message')
      alert('Please enter a message')
      return
    }

    try {
      // Clear textarea
      textarea.value = ''
      textarea.style.height = 'auto'

      // Create FormData for file upload support
      const formData = new FormData()
      formData.append('userMessage', message)
      formData.append('generatorType', this.generatorType)  // Use CURRENT instance's type

      // Add file if exists
      const fileInput = document.getElementById('chat-file-input')
      if (fileInput && fileInput.files.length > 0) {
        formData.append('attachment', fileInput.files[0])
        fileInput.value = '' // Clear file input
      }

      // Show loading state
      this.showLoadingMessage(message)

      // Send to backend
      console.log('📤 Sending message with generatorType:', this.generatorType)
      
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      console.log('📥 Response status:', response.status)

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const result = await response.json()
      console.log('✅ Message sent successfully, ID:', result.data._id)
      console.log('✅ Received message with generatorType:', result.data.generatorType)
      console.log('📋 Full response:', result.data)
      
      // Add to local messages - only if it matches our generator type
      if (result.data.generatorType === this.generatorType) {
        this.messages.push(result.data)
        console.log('✅ Added message to local array. Total messages:', this.messages.length)
      } else {
        console.warn('⚠️ Message generatorType mismatch! Expected:', this.generatorType, 'Got:', result.data.generatorType)
      }
      
      // Update display
      this.displayMessages()
      
      // Poll for AI response
      console.log('⏳ Starting to poll for AI response...')
      this.waitForResponse(result.data._id)

    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message: ' + error.message)
    }
  }

  showLoadingMessage(userMsg) {
    const chatContainer = this.findChatContainer()
    if (!chatContainer) return

    const userMessage = document.createElement('div')
    userMessage.className = 'flex justify-end'
    userMessage.innerHTML = `
      <div class="shadow-theme-xs bg-brand-100 dark:bg-brand-500/20 max-w-[480px] rounded-xl rounded-tr-xs px-4 py-3">
        <p class="text-left text-sm font-normal text-gray-800 dark:text-white/90">${this.escapeHtml(userMsg)}</p>
      </div>
    `
    chatContainer.appendChild(userMessage)

    // Loading indicator
    const loadingMsg = document.createElement('div')
    loadingMsg.className = 'flex justify-start'
    loadingMsg.id = 'loading-message'
    loadingMsg.innerHTML = `
      <div class="shadow-theme-xs max-w-[480px] rounded-xl rounded-tl-xs bg-gray-100 px-4 py-3 dark:bg-white/5">
        <div class="flex gap-2">
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
        </div>
      </div>
    `
    chatContainer.appendChild(loadingMsg)
    
    // Scroll to bottom
    this.scrollToBottom()
  }

  async waitForResponse(messageId, attempts = 0) {
    const maxAttempts = 20 // Up to 20 seconds
    
    // Poll faster initially (every 200ms for first 5 attempts), then every 1s
    const pollInterval = attempts < 5 ? 200 : 1000

    if (attempts >= maxAttempts) {
      console.log('❌ Response timeout after 20 seconds')
      return
    }

    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch message')

      const result = await response.json()
      const message = result.data

      console.log(`🔄 Attempt ${attempts + 1}: Status=${message.status}, HasResponse=${!!message.aiResponse}`)

      if (message.aiResponse && message.status === 'completed') {
        console.log('✨ AI Response received:', message.aiResponse)
        // Found response, update display
        this.messages = this.messages.map(m => 
          m._id === messageId ? message : m
        )
        this.displayMessages()
        return
      }

      // Wait and retry with adaptive interval
      setTimeout(() => this.waitForResponse(messageId, attempts + 1), pollInterval)

    } catch (error) {
      console.error('Error checking response:', error)
    }
  }

  async loadMessages() {
    try {
      console.log('📂 Loading messages for generator type:', this.generatorType)
      
      const response = await fetch(`/api/chat/messages/${this.generatorType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        console.error('❌ Failed to load messages - Status:', response.status)
        throw new Error('Failed to load messages')
      }

      const result = await response.json()
      console.log('✅ Loaded', result.data?.length || 0, 'messages for', this.generatorType)
      
      // IMPORTANT: Filter messages to only include this generator type
      // This prevents old messages from other generators showing up
      this.messages = (result.data || []).filter(msg => 
        msg.generatorType === this.generatorType
      )
      
      console.log('📋 After filtering:', this.messages.length, 'messages for', this.generatorType)
      console.log('🔍 Generator types in messages:', [...new Set(this.messages.map(m => m.generatorType))])
      
      this.displayMessages()

    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  async checkForNewMessages() {
    try {
      const response = await fetch(`/api/chat/messages/${this.generatorType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) return

      const result = await response.json()
      const newMessages = result.data || []

      // Check if there are new messages or updates
      if (newMessages.length > this.messages.length || 
          this.hasMessageUpdates(newMessages)) {
        this.messages = newMessages
        this.displayMessages()
      }

    } catch (error) {
      console.error('Error checking messages:', error)
    }
  }

  hasMessageUpdates(newMessages) {
    return newMessages.some((newMsg, idx) => {
      const oldMsg = this.messages[idx]
      return oldMsg && newMsg.status !== oldMsg.status && newMsg.aiResponse
    })
  }

  displayMessages() {
    const chatContainer = this.findChatContainer()
    if (!chatContainer) {
      console.error('❌ Chat container not found - cannot display messages')
      return
    }

    console.log('📝 Displaying', this.messages.length, 'messages in container')
    console.log('📏 Container size:', { width: chatContainer.clientWidth, height: chatContainer.clientHeight })

    // Clear and rebuild
    chatContainer.innerHTML = ''

    if (this.messages.length === 0) {
      console.log('ℹ️ No messages to display')
      return
    }

    // Add each message - user + AI response
    this.messages.forEach((msg, idx) => {
      console.log(`📨 Adding message ${idx + 1}:`, { userMessage: msg.userMessage.substring(0, 30), hasResponse: !!msg.aiResponse, status: msg.status })
      
      // User message
      const userDiv = document.createElement('div')
      userDiv.className = 'flex justify-end mb-4'
      userDiv.innerHTML = `
        <div class="shadow-theme-xs bg-brand-100 dark:bg-brand-500/20 max-w-[480px] rounded-xl rounded-tr-xs px-4 py-3">
          <p class="text-left text-sm font-normal text-gray-800 dark:text-white/90">
            ${this.escapeHtml(msg.userMessage)}
          </p>
          ${msg.attachment ? `
            <div class="mt-2 text-xs text-gray-600 dark:text-gray-400">
              📎 ${msg.attachment.filename}
            </div>
          ` : ''}
        </div>
      `
      chatContainer.appendChild(userDiv)
      console.log('✅ Added user message to DOM')

      // AI response (if exists and completed)
      if (msg.aiResponse && msg.status === 'completed') {
        const aiDiv = document.createElement('div')
        aiDiv.className = 'flex justify-start mb-4'
        aiDiv.innerHTML = `
          <div>
            <div class="shadow-theme-xs max-w-[480px] rounded-xl rounded-tl-xs bg-gray-100 px-4 py-3 dark:bg-white/5">
              <p class="text-sm leading-5 text-gray-800 dark:text-white/90">
                ${this.escapeHtml(msg.aiResponse)}
              </p>
            </div>
            <div class="mt-3">
              <button
                class="flex h-8 items-center gap-1 rounded-full border border-gray-100 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-500 dark:border-white/5 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-white/90"
                onclick="navigator.clipboard.writeText('${this.escapeHtml(msg.aiResponse).replace(/'/g, "\\'")}'); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy', 2000)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M14.1567 14.1628H7.08803C6.39768 14.1628 5.83803 13.6031 5.83803 12.9128V5.8441M14.1567 14.1628L14.1567 15.416C14.1567 16.1064 13.5971 16.666 12.9067 16.666H4.58478C3.89442 16.666 3.33478 16.1064 3.33478 15.416V7.0941C3.33478 6.40374 3.89442 5.8441 4.58478 5.8441H5.83803M14.1567 14.1628H15.4152C16.1056 14.1628 16.6652 13.6031 16.6652 12.9128L16.6652 4.58392C16.6652 3.89357 16.1056 3.33392 15.4152 3.33392H7.08803C6.39768 3.33392 5.83803 3.89357 5.83803 4.58392V5.8441" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Copy
              </button>
            </div>
          </div>
        `
        chatContainer.appendChild(aiDiv)
        console.log('✅ Added AI response to DOM')
      } else if (msg.status === 'pending') {
        // Show loading state
        const loadingDiv = document.createElement('div')
        loadingDiv.className = 'flex justify-start mb-4'
        loadingDiv.innerHTML = `
          <div class="shadow-theme-xs max-w-[480px] rounded-xl rounded-tl-xs bg-gray-100 px-4 py-3 dark:bg-white/5">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              ⏳ Processing your request...
            </p>
          </div>
        `
        chatContainer.appendChild(loadingDiv)
        console.log('✅ Added loading state to DOM')
      }
    })

    console.log('✅ All messages displayed - DOM now has', chatContainer.children.length, 'child elements')
    this.scrollToBottom()
  }

  addMessageToDisplay(container, msg, idx) {
    // User message
    const userDiv = document.createElement('div')
    userDiv.className = 'flex justify-end'
    userDiv.innerHTML = `
      <div class="shadow-theme-xs bg-brand-100 dark:bg-brand-500/20 max-w-[480px] rounded-xl rounded-tr-xs px-4 py-3">
        <p class="text-left text-sm font-normal text-gray-800 dark:text-white/90">
          ${this.escapeHtml(msg.userMessage)}
        </p>
        ${msg.attachment ? `
          <div class="mt-2 text-xs text-gray-600 dark:text-gray-400">
            📎 ${msg.attachment.filename}
          </div>
        ` : ''}
      </div>
    `
    container.appendChild(userDiv)

    // AI response (if exists)
    if (msg.aiResponse) {
      const aiDiv = document.createElement('div')
      aiDiv.className = 'flex justify-start'
      aiDiv.dataset.messageId = msg._id
      aiDiv.innerHTML = `
        <div>
          <div class="shadow-theme-xs max-w-[480px] rounded-xl rounded-tl-xs bg-gray-100 px-4 py-3 dark:bg-white/5">
            <p class="text-sm leading-5 text-gray-800 dark:text-white/90">
              ${this.escapeHtml(msg.aiResponse)}
            </p>
          </div>
          <div class="mt-3">
            <button
              class="flex h-8 items-center gap-1 rounded-full border border-gray-100 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-500 dark:border-white/5 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-white/90"
              onclick="navigator.clipboard.writeText('${this.escapeHtml(msg.aiResponse).replace(/'/g, "\\'")}'); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy', 2000)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M14.1567 14.1628H7.08803C6.39768 14.1628 5.83803 13.6031 5.83803 12.9128V5.8441M14.1567 14.1628L14.1567 15.416C14.1567 16.1064 13.5971 16.666 12.9067 16.666H4.58478C3.89442 16.666 3.33478 16.1064 3.33478 15.416V7.0941C3.33478 6.40374 3.89442 5.8441 4.58478 5.8441H5.83803M14.1567 14.1628H15.4152C16.1056 14.1628 16.6652 13.6031 16.6652 12.9128L16.6652 4.58392C16.6652 3.89357 16.1056 3.33392 15.4152 3.33392H7.08803C6.39768 3.33392 5.83803 3.89357 5.83803 4.58392V5.8441" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Copy
            </button>
          </div>
        </div>
      `
      container.appendChild(aiDiv)
    }
  }

  updateMessageWithResponse(element, msg) {
    // Update with AI response if not already shown
    if (!element.querySelector('.mt-3')) {
      const aiText = element.querySelector('p')
      if (aiText) aiText.textContent = msg.aiResponse

      const copyBtn = document.createElement('div')
      copyBtn.className = 'mt-3'
      copyBtn.innerHTML = `
        <button
          class="flex h-8 items-center gap-1 rounded-full border border-gray-100 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-500 dark:border-white/5 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-white/90"
          onclick="navigator.clipboard.writeText('${msg.aiResponse.replace(/'/g, "\\'")}'); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy', 2000)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M14.1567 14.1628H7.08803C6.39768 14.1628 5.83803 13.6031 5.83803 12.9128V5.8441M14.1567 14.1628L14.1567 15.416C14.1567 16.1064 13.5971 16.666 12.9067 16.666H4.58478C3.89442 16.666 3.33478 16.1064 3.33478 15.416V7.0941C3.33478 6.40374 3.89442 5.8441 4.58478 5.8441H5.83803M14.1567 14.1628H15.4152C16.1056 14.1628 16.6652 13.6031 16.6652 12.9128L16.6652 4.58392C16.6652 3.89357 16.1056 3.33392 15.4152 3.33392H7.08803C6.39768 3.33392 5.83803 3.89357 5.83803 4.58392V5.8441" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Copy
        </button>
      `
      element.appendChild(copyBtn)
    }
  }

  triggerFileUpload() {
    let fileInput = document.getElementById('chat-file-input')
    
    if (!fileInput) {
      fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.id = 'chat-file-input'
      fileInput.style.display = 'none'
      fileInput.addEventListener('change', (e) => {
        const fileName = e.target.files[0]?.name || 'File selected'
        console.log('File selected:', fileName)
        alert(`✅ File selected: ${fileName}\nIt will be attached to your next message.`)
      })
      document.body.appendChild(fileInput)
    }
    
    fileInput.click()
  }

  findChatContainer() {
    // Find the scrollable chat message container
    console.log('🔎 Searching for chat container...')
    
    const containers = document.querySelectorAll('.custom-scrollbar')
    console.log('📍 Found', containers.length, 'containers with custom-scrollbar class')
    if (containers.length > 0) {
      console.log('✅ Using first custom-scrollbar container')
      return containers[0]
    }

    const overflowContainers = document.querySelectorAll('[class*="overflow-y-auto"]')
    console.log('📍 Found', overflowContainers.length, 'containers with overflow-y-auto')
    if (overflowContainers.length > 0) {
      console.log('✅ Using first overflow-y-auto container')
      return overflowContainers[0]
    }

    console.error('❌ Chat container not found!')
    return null
  }

  scrollToBottom() {
    const container = this.findChatContainer()
    if (container) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight
      }, 100)
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

// Initialize chat when page loads
function initializeAIChat() {
  const xDataRaw = document.body.getAttribute('x-data')
  console.log('📋 Full x-data:', xDataRaw)
  
  // Try to extract generatorType first (if explicit)
  let finalType = xDataRaw?.match(/generatorType:\s*'(\w+)'/)?.[1]
  
  if (!finalType) {
    // Fall back to extracting from page and processing
    const match = xDataRaw?.match(/page:\s*'(\w+)'/)?.[1]
    console.log('🔍 Extracted page value:', match)
    
    finalType = match || 'text'
    console.log('📝 Generator type before processing:', finalType)
    
    finalType = finalType.replace('Generator', '').toLowerCase()
  }
  
  console.log('✅ Final generator type:', finalType)
  
  // Destroy old instance if exists
  if (window.aiChat) {
    console.log('🗑️ Destroying old AIChat instance')
    window.aiChat = null
  }
  
  // Create new instance for this page
  window.aiChat = new AIChat(finalType)
  console.log('✅ Real-time chat initialized for:', finalType)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAIChat)
} else {
  initializeAIChat()
  }
  
  // Create new instance for this page
  window.aiChat = new AIChat(finalType)
  console.log('✅ Real-time chat initialized for:', finalType)
}
