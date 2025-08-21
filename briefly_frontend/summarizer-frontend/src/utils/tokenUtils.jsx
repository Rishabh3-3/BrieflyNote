export const setToken = (token) => {
  //localStorage.setItem("token", token); // Save the token to localStorage
  try {
    localStorage.setItem("token", token);
  } catch (error) {
    console.error("Error saving token to localStorage:", error);
    throw new Error("Failed to save authentication token");
  }
};

export const getToken = () => {
  //return localStorage.getItem("token"); // Retrieve the token from localStorage
  try {
    return localStorage.getItem("token");
  } catch (error) {
    console.error("Error retrieving token from localStorage:", error);
    return null;
  }
};

export const removeToken = () => {
  //localStorage.removeItem("token"); // Remove the token from localStorage
  try {
    localStorage.removeItem("token");
  } catch (error) {
    console.error("Error removing token from localStorage:", error);
  }
};

// Add token validation
export const isValidToken = (token) => {
  if (!token) return false;
  try {
    // Simple format check (JWT typically has 3 parts separated by dots)
    const parts = token.split('.');
    return parts.length === 3;
  } catch {
    return false;
  }
};
