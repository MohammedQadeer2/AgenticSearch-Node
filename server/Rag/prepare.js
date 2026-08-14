import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { OpenAIEmbeddings } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(currentDirectory, "../.env") });


const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-embedding-001",
});

//pinecone client
const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

const vectorStore = await PineconeStore.fromExistingIndex(
    embeddings,
    {
        pineconeIndex,
        maxConcurrency: 5,
    }
);

export function getVectorStore() {
    return vectorStore;
}

// Replaced My old indexTheDocument function with this updated version:
export async function indexTheDocument(filePath, docId) {
    const loader = new PDFLoader(filePath, { splitPages: false });

    const doc = await loader.load();
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
    });

    const text = await splitter.splitText(doc[0].pageContent);

    // Map each chunk of text to a Document object with custom metadata
    const documents = text.map((chunk) => {
        return {
            pageContent: chunk,
            metadata: {
                ...doc[0].metadata, // Keeps original PDF metadata (like source name, page counts)
                doc_id: docId,      // CRITICAL: Adds our custom unique document identifier
            },
        };
    });

    // When vectorStore adds these documents, Pinecone stores 'doc_id' alongside the vector
    await vectorStore.addDocuments(documents);
}

