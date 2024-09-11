import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please provide username and password" });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        let isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (isPasswordCorrect) {
            let token = crypto.randomBytes(20).toString("hex");

            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ token: token });
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid username or password" });
        }
    } catch (e) {
        console.error(`Error during login: ${e.message}`);
        return res.status(500).json({ message: `Something went wrong ${e.message}` });
    }
};

const register = async (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }

    try {
        // Log input data
        console.log("Registering user with data:", { name, username });

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log("User already exists:", username);
            return res.status(httpStatus.CONFLICT).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            username,
            password: hashedPassword
        });

        await newUser.save();
        console.log("User registered successfully:", newUser);

        return res.status(httpStatus.CREATED).json({ message: "User registered successfully" });
    } catch (e) {
        console.error(`Error during registration: ${e.message}`);
        return res.status(500).json({ message: `Something went wrong ${e.message}` });
    }
};


const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        const meetings = await Meeting.find({ user_id: user.username });
        res.json(meetings);
    } catch (e) {
        console.error(`Error fetching user history: ${e.message}`);
        res.status(500).json({ message: `Something went wrong ${e.message}` });
    }
};

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        });

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Meeting added to history" });
    } catch (e) {
        console.error(`Error adding meeting to history: ${e.message}`);
        res.status(500).json({ message: `Something went wrong ${e.message}` });
    }
};

export { login, register, getUserHistory, addToHistory };
