import { apiRequest } from "./apiClient";

export function getConversations(userId, workspace) {
  return apiRequest(`/api/conversations?userId=${userId}&workspace=${workspace}`);
}

export function createConversation(userId, workspace) {
  return apiRequest("/api/conversations", {
    method: "POST",
    body: JSON.stringify({ userId, workspace }),
  });
}

export function getMessages(conversationId, userId) {
  return apiRequest(`/api/conversations/${conversationId}/messages?userId=${userId}`);
}
