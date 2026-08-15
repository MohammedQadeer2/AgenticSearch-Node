import OpenAi from "openai";
import { tavily } from "@tavily/core";
import dotenv from "dotenv";
import Message from "./models/message.model.js";
dotenv.config();

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const client = new OpenAi({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export async function Generate(conversationId) {
    const baseMessage = [
        {
            role: 'system',
            content: `You are Jarvis, a smart personal assistant.

             CRITICAL FORMATTING RULES:
            - Always structure your answers beautifully with clear, readable spacing.
            - Use clean newlines (line breaks) between different concepts, steps, or list items.
            - Avoid long walls of continuous text. If you are providing a list, write each item on its own new line.
            - Never omit newlines or compress lists into a single continuous line, even if asked to avoid special symbols. Use standard newline line breaks.

            If you know the answer to a question, answer it directly in plain English.
            If the answer requires real-time, local, or up-to-date information, or if you don't know the answer, use the available function.

            Examples:

            Q: What is the capital of France?
            A: The capital of France is Paris.

            Q: What's the weather in Mumbai right now?
            A: (use the search tool to find the latest weather)

            Q: Who is the Prime Minister of India?
            A: The current Prime Minister of India is Narendra Modi.

            Q: Tell me the latest IT news.
            A: (use the search tool to get the latest news)

            Current date and time: ${new Date().toUTCString()}               
             `
        },
    ]

// extracting message from conversationId 
    const savedMessages = await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

        console.log(`savedMessages : ${JSON.stringify(savedMessages[0].content)}`);
// adding that message to the messages array with systemPrompt and will give it to the llm
    const messages = [
        ...baseMessage,
        ...savedMessages.reverse().map((message) => ({
            role: message.role,
            content: message.content
        }))
    ];
    
    const MAX_TRIES = 10;
    let count = 0;

    while (true) {
         if(count > MAX_TRIES) {
            return "I could not get the suitable result for this query, Please Try Again!";
         }

         count++;

        const completions = await client.chat.completions.create({
            temperature: 0.7,
            model: "openai/gpt-oss-20b",
            tools: [
                {
                    "type": "function",
                    "function": {
                        "name": "webSearch",
                        "description": "search the information on the web for latest and real time information",
                        "parameters": {
                            // JSON Schema object
                            "type": "object",
                            "properties": {
                                "query": {
                                    "type": "string",
                                    "description": "The search this query on internet",
                                }
                            },
                            "required": ["query"]
                        }
                    }
                }
            ],
            messages: messages,

        });

        messages.push(completions.choices[0].message);
        const toolCall = completions.choices[0].message.tool_calls;
        const aiResponse = completions.choices[0].message.content;
        if (!toolCall) {
            console.log(aiResponse.replace(/\*\*/g, ""));
            return (aiResponse.replace(/\*\*/g, ""));
        }
        for (const tool of toolCall) {
            const functionName = tool.function.name;
            const functionParams = tool.function.arguments;
            if (functionName === "webSearch") {
                console.log(`Calling webSearch with query: ${functionParams} \n\n`);
                const res = await webSearch(JSON.parse(functionParams));
                // console.log(`Web Search Result: ${JSON.stringify(res)}`);
                messages.push({
                    tool_call_id: tool.id,
                    role: 'tool',
                    name: functionName,
                    content: res,
                });
            }
        }
    }
}

async function webSearch({ query }) {
    console.log(`searching the web for : ${query} \n`);
    const response = await tvly.search(query);
    const finalResult = response.results.map(( result) => result.content).join("\n\n");
    return finalResult;
}
