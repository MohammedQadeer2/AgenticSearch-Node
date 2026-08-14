import express from "express";
import {
    createConversation,
    deleteConversation,
    getConversations,
    getMessages
} from "../controllers/conversation.controller.js";

const conversationRouter = express.Router();

conversationRouter.post("/", createConversation);
conversationRouter.get("/", getConversations);
conversationRouter.get("/:conversationId/messages", getMessages);
conversationRouter.delete("/:conversationId", deleteConversation);

export default conversationRouter;
