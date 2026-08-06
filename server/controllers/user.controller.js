import User from "../models/user.model.js";
import  genToken from "../config/token.js";
import bcrypt from "bcryptjs";

export const signUp = async (req, res) => {
    try{
        const { name, email, password } = req.body;
        const isUserExist = await User.findOne({ email });
        if(isUserExist) {
            return res.status(400).json({message: "user already exists!!"});
        }
        
        if(password.length < 6) {
            return res.status(400).json({message: "password must be atleasts 6 characters long!!"});
        }
        const userPassword = await bcrypt.hash(password, 10);
        const newUser = await User({
            name,
            password: userPassword,
            email,
        });

        await newUser.save();

        const token = await genToken(newUser._id);

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 60 * 60 * 24 * 1000,
            samesite: "none",
            secure: true,
        });
        res.status(201).json(newUser);
    }catch(err) {
        res.status(400).json({message: "signUp Error!"})
    }
}

export const signIn = async(req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
        return res.status(400).json({message: "User doesn't exist!!, Please SignUp First"});
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) {
        return res.status(400).json({message: "Incorrect password!"});
    }

    const token = await genToken(user._id);
    res.cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 60 * 60 * 24 * 1000,
        samesite: 'none',
        secure: true
    });
    return res.status(201).json(user);
}

export const signOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // true in production (https)
      sameSite: "lax",
    });

    return res.status(200).json({ message: "Logged out successfully" });

  } catch (err) {
    return res.status(400).json({ message: "Logout failed" });
  }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: "Could not load profile" });
    }
};
