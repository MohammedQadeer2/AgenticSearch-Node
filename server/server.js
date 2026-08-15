import express from 'express';
import cors from 'cors';
import connectDb from './config/db.js'
import Conversation from "./models/conversation.model.js";
import Message from "./models/message.model.js";
import authRouter from './routes/auth.route.js';
import chatRouter from './routes/chat.route.js';
import conversationRouter from './routes/conversation.route.js';
import documentRouter from './routes/document.route.js';
const app = express();

app.use(cors());
const PORT = 3001;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use('/', chatRouter);
app.use("/api/auth", authRouter);
app.use("/api/conversations", conversationRouter);
app.use("/api/documents", documentRouter);

app.listen(PORT, () => {
    connectDb();
    console.log("Server is running on the port " + PORT);
});
