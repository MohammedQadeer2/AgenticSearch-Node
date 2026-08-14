import mongoose from "mongoose";
const { Schema } = mongoose;

const ingestedDocumentSchema = new Schema({
    filename: { 
        type: String, 
        required: true, 
        unique: true // Guarantees we cannot save the exact same filename twice
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const IngestedDocument = mongoose.model('IngestedDocument', ingestedDocumentSchema);
export default IngestedDocument;
