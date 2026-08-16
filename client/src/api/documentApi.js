import { API_BASE_URL } from "./apiClient";

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("pdf", file); // Key must be named "pdf" to match multer's upload.single("pdf")

  const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: "POST",
    body: formData,
    // Note: Do NOT pass options.headers with Content-Type. 
    // This allows the browser to correctly set: multipart/form-data; boundary=----WebKitFormBoundary...
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to upload document");
  }

  return data;
}

// to get the all ingestedDocument from Pinecone
export async function getDocuments() {
  const response = await fetch(`${API_BASE_URL}/api/documents`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load documents list");
  }
  return data;
}
