import express from 'express';
import cors from 'cors';
import { Generate } from "./LLM_Response.js";
const app = express();

app.use(cors());
const PORT = 3001;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/chat', async (req, res) => {
    const {message, userId} = req.body;

    if(!message || !userId) {
        res.status(400).json("userId or message is likely undefined!")
    }

    // console.log(`Received message: ${message}`);
    const response = await Generate(message, userId);
    res.json({message : response, userId: userId });
});

app.listen(PORT, () => {
    console.log("Server is running on the port " + PORT);
});