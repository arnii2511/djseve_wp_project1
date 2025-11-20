// Utility function to check if an image URL is a placeholder
export function isPlaceholderUrl(url) {
  if (!url || typeof url !== 'string') return true;
  
  const urlLower = url.toLowerCase().trim();
  
  // Check for empty or invalid URLs
  if (urlLower === '' || urlLower === 'null' || urlLower === 'undefined') return true;
  
  const placeholderPatterns = [
    'via.placeholder.com',
    'via.placeholder',
    'placeholder.com',
    'placeholder',
    'placehold.it',
    'placehold.co',
    'dummyimage.com',
    'loremflickr.com',
    /^\d+x\d+/, // Matches patterns like "900x400"
    /^https?:\/\/\d+x\d+/, // Matches "http://900x400"
    /text=/i, // Matches URLs with text= parameter (common in placeholders)
    /via\.placeholder/i, // More specific check
  ];
  
  // Check for placeholder patterns
  const isPlaceholder = placeholderPatterns.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(url);
    }
    return urlLower.includes(pattern.toLowerCase());
  });
  
  // Additional check: if URL contains common placeholder indicators
  if (urlLower.includes('placeholder') || urlLower.includes('dummy') || urlLower.includes('lorem')) {
    return true;
  }
  
  return isPlaceholder;
}

// Get a safe image URL or return null if it's a placeholder
export function getSafeImageUrl(url) {
  if (!url || isPlaceholderUrl(url)) {
    return null;
  }
  
  // Additional validation: ensure it's a valid URL format
  try {
    // If it's a relative URL, it's probably fine
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return url;
    }
    
    // Try to parse as URL to validate
    new URL(url);
    return url;
  } catch (e) {
    // If URL parsing fails and it's not a relative path, it might be invalid
    if (!url.startsWith('/') && !url.startsWith('./') && !url.startsWith('../')) {
      return null;
    }
    return url;
  }
}

