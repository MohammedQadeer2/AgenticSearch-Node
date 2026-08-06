import mongoose from "mongoose";
const { Schema } = mongoose;

const conversationSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    title: { type: String, required: true },
    workspace: {
        type: String,
        enum: ["general", "company"],
        required: true,
        default: "general"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

conversationSchema.index({ userId: 1, workspace: 1, createdAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
