import Groq from "groq-sdk";
import { getVectorStore } from "./prepare.js";
import Message from "../models/message.model.js";

const vectorStore = getVectorStore();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function companyChat(conversationId, userQuery) {
    const savedMessages = await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

    const relatedChunks = await vectorStore.similaritySearch(userQuery, 3);
    const context = relatedChunks.length > 0
        ? relatedChunks.map((chunk) => chunk.pageContent).join("\n\n")
        : "No relevant company context was found.";

    const messages = [
        {
            role: "system",
            content: "You are a Company Knowledge assistant. Answer using the provided company context. If the answer is not in the context, say: I don't know. You may answer simple greetings naturally."
        },
        {
            role: "system",
            content: `Company context:\n${context}`
        },
        ...savedMessages.reverse().map((message) => ({
            role: message.role,
            content: message.content
        }))
    ];

    const completions = await groq.chat.completions.create({
        messages: messages,
        model: "openai/gpt-oss-20b",
    });

    const aiResponse = completions.choices[0].message.content;
    return aiResponse.replace(/\*\*/g, "");
}
