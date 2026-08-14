import fs from "fs/promises";
import { indexTheDocument } from "../Rag/prepare.js";
import IngestedDocument from "../models/document.model.js";

export const uploadDocument = async (req, res) => {
    // 1. Verify if a file was successfully captured by multer
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded. Please upload a valid PDF." });
    }

    const filePath = req.file.path;
    const filename = req.file.originalname;

    // Inside server/controllers/document.controller.js, update this portion of your try/catch block:

    try {
        // 1. Prevent Duplicate Ingestion check
        const alreadyExists = await IngestedDocument.findOne({ filename });
        if (alreadyExists) {
            return res.status(400).json({
                message: `The document "${filename}" has already been indexed in company knowledge.`
            });
        }

        // 2. Create the document record in MongoDB FIRST to obtain its unique ID
        const dbDoc = await IngestedDocument.create({ filename });
        const uniqueDocId = dbDoc._id.toString(); // Extract the string version of the MongoDB ObjectId

        console.log(`Starting vector indexing for: ${filename} with doc_id: ${uniqueDocId}`);

        // 3. Pass both filePath AND uniqueDocId to the updated indexing function
        await indexTheDocument(filePath, uniqueDocId);

        console.log(`Successfully indexed vector embeddings for: ${filename}`);

        return res.status(200).json({
            message: `Successfully uploaded and indexed "${filename}" in company knowledge base!`
        });

    } catch (error) {
        // If indexing fails, delete the MongoDB record so it doesn't block future uploads
        await IngestedDocument.deleteOne({ filename });

        console.error("Error during document ingestion:", error);
        return res.status(500).json({
            message: error.message || "Failed to parse and index document."
        });
    } finally {
        // 5. CRITICAL: Clean up the local server disk!
        // We delete the file in a 'finally' block so that even if indexing fails,
        // the local temporary file is guaranteed to be deleted.
        try {
            await fs.unlink(filePath);
            console.log(`Temporary storage file deleted: ${filePath}`);
        } catch (unlinkError) {
            console.error(`Failed to delete temporary file: ${filePath}`, unlinkError);
        }
    }
};
