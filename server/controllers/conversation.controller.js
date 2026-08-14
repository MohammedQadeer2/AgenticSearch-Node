import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

const workspaces = ["general", "company"];

// Inside server/controllers/conversation.controller.js, replace createConversation:

export const createConversation = async (req, res) => {
    try {
        const { userId, title, workspace = "general", documentId } = req.body; // <-- Extract documentId here

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        if (!workspaces.includes(workspace)) {
            return res.status(400).json({ message: "workspace must be general or company" });
        }

        // Create the conversation in database, appending documentId if provided
        const conversation = await Conversation.create({
            userId,
            title: title?.trim() || "New chat",
            workspace,
            documentId: workspace === "company" ? documentId : undefined // <-- Save it only for company workspace
        });

        return res.status(201).json(conversation);
    } catch (error) {
        console.error("Create conversation error:", error);
        return res.status(500).json({ message: "Could not create conversation" });
    }
};


export const getConversations = async (req, res) => {
    try {
        const { userId, workspace } = req.query;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        if (!workspaces.includes(workspace)) {
            return res.status(400).json({ message: "workspace must be general or company" });
        }

        const conversations = await Conversation.find({ userId, workspace })
            .sort({ createdAt: -1 });

        return res.status(200).json(conversations);
    } catch (error) {
        return res.status(500).json({ message: "Could not load conversations" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { userId } = req.query;

        const conversation = await Conversation.findOne({
            _id: conversationId,
            userId
        });

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 });

        return res.status(200).json(messages);
    } catch (error) {
        return res.status(500).json({ message: "Could not load messages" });
    }
};

export const deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        // Delete only a conversation that belongs to this user.
        const conversation = await Conversation.findOneAndDelete({
            _id: conversationId,
            userId
        });

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        // Remove messages which belonged to this conversation too.
        await Message.deleteMany({ conversationId });

        return res.status(200).json({ message: "Conversation deleted" });
    } catch (error) {
        console.error("Delete conversation error:", error);
        return res.status(500).json({ message: "Could not delete conversation" });
    }
};
