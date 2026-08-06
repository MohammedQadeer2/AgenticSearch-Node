import express from "express";
import {
    createConversation,
    getConversations,
    getMessages
} from "../controllers/conversation.controller.js";

const conversationRouter = express.Router();

conversationRouter.post("/", createConversation);
conversationRouter.get("/", getConversations);
conversationRouter.get("/:conversationId/messages", getMessages);

export default conversationRouter;
