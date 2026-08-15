import Groq from "groq-sdk";
import { getVectorStore } from "./prepare.js";
import Message from "../models/message.model.js";

const vectorStore = getVectorStore();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Replace your old companyChat function with this updated version:
export async function companyChat(conversationId, userQuery, targetDocId) {
    const savedMessages = await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

    // CRITICAL CHANGE: Pass the filter object as the third argument
    // This tells Pinecone: "Only search through chunks where metadata.doc_id equals targetDocId"
    const filter = targetDocId ? { doc_id: targetDocId } : undefined;

    // Perform the similarity search using the filter
    const relatedChunks = await vectorStore.similaritySearch(userQuery, 3, filter);

    const context = relatedChunks.length > 0
        ? relatedChunks.map((chunk) => chunk.pageContent).join("\n\n")
        : "No relevant company context was found for this document.";

    const messages = [
        {
            role: "system",
            content: `You are a Company Knowledge assistant. Answer using the provided company context. 
            If the answer is not in the context, say: "I don't know." You may answer simple greetings naturally.
        
            CRITICAL FORMATTING RULES:
            - Always structure your answers beautifully with clean line breaks (newlines) between steps, points, or paragraphs.
            - Never compress your response into a single line or a continuous block of text. Ensure lists are formatted vertically.`
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
