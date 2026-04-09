// Fix missing images by replacing with placeholder avatars and product images
(function() {
  // SVG placeholder (no external dependency)
  const SVG_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23E9ECEF" width="300" height="300"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial,sans-serif" font-size="20" fill="%236C757D" text-anchor="middle" dy=".3em"%3ENo Image Available%3C/text%3E%3C/svg%3E'

  // Map of missing images to placeholder avatars
  const userImageMap = {
    'user-02.jpg': 'https://ui-avatars.com/api/?name=Jessica+Smith&background=FF6B6B&color=fff&bold=true&size=128',
    'user-03.jpg': 'https://ui-avatars.com/api/?name=Alexander+Davis&background=4ECDC4&color=fff&bold=true&size=128',
    'user-04.jpg': 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=95E1D3&color=fff&bold=true&size=128',
    'user-05.jpg': 'https://ui-avatars.com/api/?name=David+Brown&background=F38181&color=fff&bold=true&size=128',
    'owner.png': 'https://ui-avatars.com/api/?name=John+Owner&background=AA96DA&color=fff&bold=true&size=128',
  }

  // SVG placeholder for user avatars (no external dependency)
  const USER_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect fill="%236C63FF" width="128" height="128"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial,sans-serif" font-size="60" fill="white" text-anchor="middle" dy=".35em" font-weight="bold"%3E%3F%3C/text%3E%3C/svg%3E'

  function fixImages() {
    // Find all images
    const images = document.querySelectorAll('img')
    
    images.forEach(img => {
      const src = img.getAttribute('src')
      if (!src) return

      // Check for user images
      if (src.includes('user-')) {
        for (const [filename, placeholderUrl] of Object.entries(userImageMap)) {
          if (src.includes(filename)) {
            console.log(`✅ Replacing ${filename} with placeholder avatar`)
            img.src = placeholderUrl
            img.onerror = null
            break
          }
        }
      }

      // Check for owner image
      if (src.includes('owner.png')) {
        console.log('✅ Replacing owner.png with placeholder avatar')
        img.src = userImageMap['owner.png']
        img.onerror = null
      }

      // Check for broken product images
      if (src.includes('product-default.jpg') || (src.includes('product/') && !src.startsWith('http'))) {
        console.log(`✅ Replacing broken product image with SVG placeholder`)
        img.src = SVG_PLACEHOLDER
        img.onerror = null
      }

      // Add error handler for any remaining broken images
      img.onerror = function() {
        console.log(`❌ Image failed to load: ${src}, using SVG fallback`)
        if (src?.includes('user-') || src?.includes('owner') || src?.includes('avatar')) {
          this.src = USER_PLACEHOLDER
        } else {
          this.src = SVG_PLACEHOLDER
        }
      }
    })
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixImages)
  } else {
    fixImages()
  }

  // Also run on any subsequent page loads
  window.addEventListener('load', fixImages)

  // Run periodically to catch dynamically loaded images
  setInterval(fixImages, 2000)

  console.log('🖼️ Image fixer loaded - using SVG placeholders for broken images')
})()
