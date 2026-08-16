import { API_BASE_URL } from "./apiClient";

/**
 * Sends a message to the backend and streams response text chunks in real-time.
 * 
 * DESIGNED TO BE BULLETPROOF:
 * If a hosting platform (like Render or Heroku) buffers the stream, all data might
 * arrive at once when the stream closes. This parser ensures that even if everything
 * arrives in a single packet, all tokens are parsed and flushed into the UI.
 */
export async function sendMessageStream(message, userId, conversationId, onChunk) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, userId, conversationId }),
  });

  if (!response.ok) {
    let errorMessage = "Failed to send message";
    try {
      const errData = await response.json();
      errorMessage = errData.message || errorMessage;
    } catch {
      // Fallback if not JSON
    }
    throw new Error(errorMessage);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let fullAccumulatedText = "";

  while (true) {
    const { done, value } = await reader.read();

    if (value) {
      // Decode the bytes and append them to our local text buffer
      buffer += decoder.decode(value, { stream: true });
      
      // SSE frames are split by newlines (\n or \r\n)
      const lines = buffer.split(/\r?\n/);
      
      // CRITICAL BUG FIX:
      // Keep the last incomplete line in the buffer so we don't try to parse half-written JSON.
      // If the stream is buffered and ends, this pop() gets the last line.
      buffer = lines.pop() || "";

      // Process each fully-received line
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;

        const dataStr = trimmed.replace(/^data:\s*/, "");
        if (dataStr === "[DONE]") {
          return fullAccumulatedText;
        }

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          if (parsed.text) {
            fullAccumulatedText += parsed.text;
            if (onChunk) {
              onChunk(parsed.text); // Stream this token to our React component state
            }
          }
        } catch (err) {
          console.warn("Failed to parse SSE line chunk:", trimmed, err);
        }
      }
    }

    // When the stream ends
    if (done) {
      // CRITICAL BUFFER FLUSH:
      // If there is any remaining text left in 'buffer' (e.g. if the proxy sent all data at once
      // without a final trailing newline), process it now before exiting.
      const finalLine = buffer.trim();
      if (finalLine && finalLine.startsWith("data:")) {
        const dataStr = finalLine.replace(/^data:\s*/, "");
        if (dataStr !== "[DONE]") {
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.text) {
              fullAccumulatedText += parsed.text;
              if (onChunk) {
                onChunk(parsed.text);
              }
            }
          } catch (err) {
            console.warn("Failed to parse final leftover chunk:", finalLine, err);
          }
        }
      }
      break;
    }
  }

  return fullAccumulatedText;
}

