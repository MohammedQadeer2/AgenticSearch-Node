import mongoose from "mongoose";
const { Schema } = mongoose;

const messageSchema = new Schema({
    conversationId: {type: Schema.Types.ObjectId, ref: 'Conversation', required: true},
    role: { type: String, enum: ["user", "assistant"], default: "user" },
    content: {type: String, required: true },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

messageSchema.index({ conversationId: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
