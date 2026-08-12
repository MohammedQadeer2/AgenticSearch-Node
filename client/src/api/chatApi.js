import { apiRequest } from "./apiClient";

export function sendMessage(message, userId, conversationId) {
  return apiRequest("/chat", {
    method: "POST",
    body: JSON.stringify({ message, userId, conversationId }),
  });
}
