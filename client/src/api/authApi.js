import { apiRequest } from "./apiClient";

export function signIn(userData) {
  return apiRequest("/api/auth/signIn", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export function signUp(userData) {
  return apiRequest("/api/auth/signUp", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export function getProfile(userId) {
  return apiRequest(`/api/auth/profile/${userId}`);
}
