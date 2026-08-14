import mongoose from "mongoose";
const { Schema } = mongoose;

// Inside server/models/conversation.model.js, update your schema definition:

const conversationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    workspace: {
        type: String,
        enum: ["general", "company"],
        required: true,
        default: "general"
    },
    // ADD THIS NEW FIELD:
    // It's optional because "general" conversations don't have associated documents.
    documentId: { 
        type: Schema.Types.ObjectId, 
        ref: 'IngestedDocument', 
        required: false 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


conversationSchema.index({ userId: 1, workspace: 1, createdAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
