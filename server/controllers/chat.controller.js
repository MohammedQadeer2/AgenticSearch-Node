import { Generate } from "../LLM_Response.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import  { companyChat } from "../Rag/Rag.js";

export const createChat = async (req, res) => {
    const { message, userId, conversationId } = req.body;
    console.log(`conversationId inside Server: ${conversationId}`);

    if (!message || !userId || !conversationId) {
        return res.status(400).json({ message: "message, userId and conversationId are required" });
    }

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
            response = await companyChat(conversationId, message);
        } else {
            response = await Generate(conversationId);
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
        return res.status(500).json({ message: "Could not generate a response" });
    }
}
