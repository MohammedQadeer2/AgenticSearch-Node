import express from "express";
import multer from "multer";
import { uploadDocument } from "../controllers/document.controller.js";

const router = express.Router();

// Define multer configuration
const upload = multer({
    dest: "uploads/", // Directory where files are temporarily stored before being deleted
    fileFilter: (req, file, cb) => {
        // Security filter: Accept only PDF files
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF documents are allowed!"), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // Enforce a 10MB maximum file size limit
    }
});

// Route configuration: 'pdf' must match the key name sent by the frontend
router.post("/upload", upload.single("pdf"), uploadDocument);

// Add this import near the top:
import IngestedDocument from "../models/document.model.js";

// Add this route near the bottom of server/routes/document.route.js:
router.get("/", async (req, res) => {
    try {
        const documents = await IngestedDocument.find().sort({ createdAt: -1 });
        return res.status(200).json(documents);
    } catch (error) {
        return res.status(500).json({ message: "Could not fetch ingested documents." });
    }
});


export default router;
