import axios from "axios";

// Two separate backend services, same as we've been calling directly with
// fetch() throughout development — Core handles auth/ads/users/etc.,
// Payment handles Razorpay order creation + verification.
export const CORE_BASE_URL = "http://localhost:9090";
export const PAYMENT_BASE_URL = "http://localhost:8081";

export const coreApi = axios.create({ baseURL: CORE_BASE_URL });
export const paymentApi = axios.create({ baseURL: PAYMENT_BASE_URL });

// Attach the JWT (if we have one) to every Core service request.
// Payment service has no security config at all, so it needs no token.
coreApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("adelevate_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Ad images come back from the backend as relative paths (e.g.
// "/ad-images/fashion.svg") so they stay environment-agnostic in the
// database. Use this whenever rendering one as an <img src>.
export function resolveImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${CORE_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
