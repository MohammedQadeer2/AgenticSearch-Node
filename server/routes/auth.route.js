import express from "express";
import { signUp, signIn, signOut, getProfile } from "../controllers/user.controller.js";

const authRouter = express.Router();

authRouter.post("/signUp", signUp);
authRouter.post("/signIn", signIn);
authRouter.get("/signOut", signOut);
authRouter.get("/profile/:userId", getProfile);

export default authRouter;
