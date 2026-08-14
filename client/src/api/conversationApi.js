import { apiRequest } from "./apiClient";

export function getConversations(userId, workspace) {
  return apiRequest(`/api/conversations?userId=${userId}&workspace=${workspace}`);
}

// Inside client/src/api/conversationApi.js, replace your createConversation function:

export function createConversation(userId, workspace, documentId = null) {
  return apiRequest("/api/conversations", {
    method: "POST",
    body: JSON.stringify({ 
      userId, 
      workspace, 
      documentId // <-- Passed to the server here!
    }),
  });
}


export function getMessages(conversationId, userId) {
  return apiRequest(`/api/conversations/${conversationId}/messages?userId=${userId}`);
}

export function deleteConversation(conversationId, userId) {
  return apiRequest(`/api/conversations/${conversationId}`, {
    method: "DELETE",
    body: JSON.stringify({ userId }),
  });
}
