import { GenerateStream } from "../LLM_Response.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { companyChatStream } from "../Rag/Rag.js";

export const createChat = async (req, res) => {
    const { message, userId, conversationId } = req.body;

    if (!message || !userId || !conversationId) {
        return res.status(400).json({ message: "message, userId and conversationId are required" });
    }

    try {
        const conversation = await Conversation.findOne({
            _id: conversationId,
            userId
        });

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (conversation.title === "New chat") {
            conversation.title = message.trim().slice(0, 60);
            await conversation.save();
        }

        // Save user message to database
        await Message.create({
            conversationId,
            role: "user",
            content: message
        });

        // Set headers for SSE (Server-Sent Events)
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no"); // CRITICAL: Disable proxy buffering on Render/Nginx
        res.flushHeaders?.();

        let streamGenerator;

        if (conversation.workspace === 'company') {
            const targetDocId = conversation.documentId ? conversation.documentId.toString() : null;
            streamGenerator = companyChatStream(conversationId, message, targetDocId);
        } else {
            streamGenerator = GenerateStream(conversationId);
        }

        let fullResponse = "";

        // Stream each token to the client in SSE format
        for await (const chunk of streamGenerator) {
            fullResponse += chunk;
            res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        }

        if (!fullResponse.trim()) {
            fullResponse = "I apologize, but I couldn't generate a response. Please try again.";
            res.write(`data: ${JSON.stringify({ text: fullResponse })}\n\n`);
        }

        // Save the full assistant response to the database
        await Message.create({
            conversationId,
            role: "assistant",
            content: fullResponse
        });

        // Notify client stream has finished cleanly
        res.write(`data: [DONE]\n\n`);
        res.end();

    } catch (error) {
        console.error("Streaming error in createChat:", error);
        if (!res.headersSent) {
            return res.status(500).json({ message: `Could not generate a response, Error: ${error.message}` });
        } else {
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
        }
    }
};

