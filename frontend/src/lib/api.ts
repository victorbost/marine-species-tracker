import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Crucial for sending and receiving cookies
});

// Store state for managing token refresh and preventing race conditions
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

// Helper to process the queue of failed requests
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      // For cookie-based authentication, the browser will automatically include
      // the new access token cookie with retried requests, so no need to pass it explicitly.
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 Unauthorized and it's not the refresh token request itself
    if (
      error.response?.status === 401 &&
      originalRequest.url !== "/v1/auth/token/refresh/"
    ) {
      // Mark the original request as retried to prevent infinite loops
      originalRequest._retry = true;

      if (isRefreshing) {
        // If a token refresh is already in progress, queue the current failed request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest)) // Retry the original request after refresh
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // Attempt to refresh the token
        // Use a direct axios call (not the 'api' instance) to avoid re-triggering this interceptor
        const refreshResponse = await axios.post(
          `${API_URL}/api/v1/auth/token/refresh/`, // Your refresh token endpoint
          {}, // No body needed; refresh token is sent via HttpOnly cookie
          { withCredentials: true },
        );

        // On successful refresh, the backend will have set new cookies.
        // Resolve all queued requests and retry them.
        isRefreshing = false;
        processQueue(null, null);

        return api(originalRequest); // Retry the original request
      } catch (refreshError) {
        // If refresh fails, clear the refreshing state and redirect to login
        isRefreshing = false;
        processQueue(refreshError, null);
        if (typeof window !== "undefined") {
          window.location.href = "/login"; // Redirect to login page
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
