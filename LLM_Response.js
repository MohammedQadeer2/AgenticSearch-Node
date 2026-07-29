import OpenAi from "openai";
import { tavily } from "@tavily/core";
import dotenv from "dotenv";
import NodeCache from 'node-cache';
dotenv.config();

const cache = new NodeCache({stdTTL: 60 * 60 * 24});

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const client = new OpenAi({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export async function Generate(userQuery, userId) {
    console.log(`userId : ${userId}`);

    const baseMessage = [
        {
            role: 'system',
            content: `You are Jarvis, a smart personal assistant.
            You are Jarvis, a smart AI assistant.

            If you know the answer to a question, answer it directly in plain English.

            If the answer requires real-time, local, or up-to-date information, or if you don't know the answer, use the available function.

            You have access to the following tool:

            searchWeb(query: string):
            Use this to search the internet for current or unknown information.

            Decide when to use your own knowledge and when to use the tool.

            Do not mention the tool unless needed.

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
        // {
        //     role: 'user',
        //     content: userQuery,
        // }
        // {
        //     role: 'user',
        //     content: "what is the current weather in mumbai?"
        //     //what is the ans of 2+2*3/4-0.7
        //     //I want to know about the latest iphone 16 launch date
        // }
    ]


    const messages = cache.get(userId) ?? baseMessage;


    messages.push({
        role: 'user',
        content: userQuery,
    });

    while (true) {
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
            cache.set(userId, messages);
            console.log(JSON.stringify(cache.data));

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
    const finalResult = response.results.map((result) => result.content).join("\n\n");
    return finalResult;
}