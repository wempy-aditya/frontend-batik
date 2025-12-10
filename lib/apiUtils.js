/**
 * Utility function for making authenticated API calls
 * Automatically handles token expiration and redirects to login
 * 
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @param {function} handleUnauthorized - Callback to handle unauthorized access
 * @returns {Promise<Response>} - Fetch response
 */
export async function authenticatedFetch(url, options = {}, handleUnauthorized = null) {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    console.error('No authentication token available');
    if (handleUnauthorized) {
      handleUnauthorized();
    } else {
      window.location.href = '/login';
    }
    throw new Error('No authentication token');
  }

  // Merge default headers with provided headers
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const fetchOptions = {
    ...options,
    headers,
  };

  const response = await fetch(url, fetchOptions);

  // Handle unauthorized responses
  if (response.status === 401 || response.status === 403) {
    console.error('Unauthorized access - token expired or invalid');
    
    if (handleUnauthorized) {
      handleUnauthorized();
    } else {
      // Clear auth data and redirect
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    
    throw new Error('UNAUTHORIZED');
  }

  return response;
}

/**
 * Utility function for making authenticated API calls and parsing JSON
 * 
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @param {function} handleUnauthorized - Callback to handle unauthorized access
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function authenticatedFetchJSON(url, options = {}, handleUnauthorized = null) {
  const response = await authenticatedFetch(url, options, handleUnauthorized);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  return await response.json();
}
