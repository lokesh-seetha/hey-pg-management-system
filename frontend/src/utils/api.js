// Helper function to make authenticated API requests
export const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If token is expired, clear storage and redirect to login
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/"; // Redirect to login
    }

    return response;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Clear authentication data (for logout)
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
