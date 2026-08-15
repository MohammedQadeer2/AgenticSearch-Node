import { Generate } from "../LLM_Response.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { companyChat } from "../Rag/Rag.js";

export const createChat = async (req, res) => {
    const { message, userId, conversationId } = req.body;

    if (!message || !userId || !conversationId) {
        return res.status(400).json({ message: "message, userId and conversationId are required" });
    }

    // 1. Set headers for SSE (Server-Sent Events)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        const conversation = await Conversation.findOne({
            _id: conversationId,
            userId
        });

        // console.log(`conversation object: ${conversation}`);

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (conversation.title === "New chat") {
            conversation.title = message.trim().slice(0, 60);
            await conversation.save();
        }

        await Message.create({
            conversationId,
            role: "user",
            content: message
        });

        let response;

        if (conversation.workspace === 'company') {
            // Retrieve the documentId stored in the conversation document
            const targetDocId = conversation.documentId ? conversation.documentId.toString() : null;

            // Pass targetDocId as the third argument to companyChat
            response = await companyChat(conversationId, message, targetDocId);
        } else {
            response = await Generate(conversationId);
            console.log(`response of the Generate function: ${response}`);
        }

        const assistantMessage = await Message.create({
            conversationId,
            role: "assistant",
            content: response
        });

        return res.json({
            message: assistantMessage.content,
            conversationId,
            sender: "llm"
        });

    } catch (error) {
        return res.status(500).json({ message: `Could not generate a response, Error: ${error}` });
    }
}
