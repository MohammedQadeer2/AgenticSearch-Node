import { ChatGroq } from "@langchain/groq";
import { END, MemorySaver, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import z from "zod";
import dotenv from "dotenv";
import Message from "./models/message.model.js";
import { GenGraph } from "./utility.js";

dotenv.config();

// Define a stable checkpointer instance
const checkpointer = new MemorySaver();

export async function* GenerateStream(conversationId) {
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
    ];

    // 1. Extract recent messages from MongoDB
    const savedMessages = await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

    if (savedMessages.length === 0) {
        yield "I couldn't find any message to respond to.";
        return;
    }

    console.log(`Saved messages count: ${savedMessages.length}`);

    // 2. Map MongoDB history into standard LangChain messages
    const langchainMessages = savedMessages.reverse().map((message) => {
        if (message.role === "assistant" || message.role === "llm") {
            return new AIMessage(message.content);
        } else {
            return new HumanMessage(message.content);
        }
    });

    // 3. Define the tools
    const get_calender_events = tool(
        async ({ query }) => {
            return JSON.stringify([
                { title: "You have a meeting with CEO of google.", time: '2pm', location: 'Gachchi Bowli' },
            ]).replace(/\*/g, "");
        },
        {
            name: "get_calender_events",
            description: "get the events of a particular date or time from the calendar tool",
            schema: z.object({
                query: z.string().describe("This is the query to find the events in the calendar"),
            }),
        }
    );

    const webSearch = new TavilySearch({
        maxResults: 3,
        topic: "general",
    });

    const Tools = [webSearch, get_calender_events];
    const toolNode = new ToolNode(Tools);

    const llm = new ChatGroq({
        model: "openai/gpt-oss-20b",
        streaming: true, // CRITICAL: Enables token streaming in ChatGroq
    }).bindTools(Tools);

    // 4. Define Graph Nodes & Conditional Routing
    async function callLlm(state) {
        console.log("Calling LLM node...");
        const result = await llm.invoke([
            new SystemMessage(baseMessage[0].content),
            ...state.messages,
        ]);
        return { messages: [result] };
    }

    function whichPath(state) {
        const lastMessage = state.messages[state.messages.length - 1];
        if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
            return "tools";
        }
        return END;
    }

    // 5. Assemble and compile the Graph
    const graph = new StateGraph(MessagesAnnotation)
        .addNode("LLM", callLlm)
        .addNode("tools", toolNode)
        .addEdge(START, "LLM")
        .addEdge("tools", "LLM")
        .addConditionalEdges("LLM", whichPath);

    const app = graph.compile({ checkpointer });

    try {
        await GenGraph(app, './StateGraph.png');
    } catch (e) {
        console.error("Graph visualization error:", e);
    }

    // 6. Stream events using LangGraph v2 event stream
    const eventStream = await app.streamEvents(
        { messages: langchainMessages },
        { 
            configurable: { thread_id: conversationId },
            version: "v2" 
        }
    );

    let streamedAnyChunks = false;

    for await (const event of eventStream) {
        // Stream token-by-token when available
        if (event.event === "on_chat_model_stream") {
            const chunk = event.data?.chunk;
            if (chunk && typeof chunk.content === "string" && chunk.content.length > 0) {
                streamedAnyChunks = true;
                yield chunk.content;
            }
        } else if (event.event === "on_chat_model_end") {
            // Fallback: If streaming was not supported for a particular node, yield the complete text
            if (!streamedAnyChunks) {
                const output = event.data?.output;
                if (output && typeof output.content === "string" && output.content.trim().length > 0) {
                    streamedAnyChunks = true;
                    yield output.content;
                }
            }
        }
    }
}

