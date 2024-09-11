import axios from "axios";
import httpStatus from "http-status";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";

export const AuthContext = createContext({});

const client = axios.create({
    baseURL: `${server}/api/v1/users`,
});

export const AuthProvider = ({ children }) => {
    const authContext = useContext(AuthContext);
    const [userData, setUserData] = useState(authContext);
    const navigate = useNavigate(); // useNavigate hook

    // Register Function
    const handleRegister = async (name, username, password) => {
        try {
            console.log(`Register request to ${client.defaults.baseURL}/register`);
            const request = await client.post("/register", {
                name,
                username,
                password,
            });

            if (request.status === httpStatus.CREATED) {
                console.log("User registered successfully:", request.data.message);
                return request.data.message;
            } else {
                console.error("Unexpected response status during registration:", request.status);
                throw new Error("Registration failed");
            }
        } catch (err) {
            console.error("Error during registration:", err.response?.data || err.message);
            throw err;
        }
    };

    // Login Function
    const handleLogin = async (username, password) => {
        try {
            console.log(`Login request to ${client.defaults.baseURL}/login`);
            const request = await client.post("/login", {
                username,
                password,
            });

            if (request.status === httpStatus.OK) {
                console.log("Login successful:", request.data);
                localStorage.setItem("token", request.data.token); // Store token in localStorage
                navigate("/home"); // Navigate to home after login
            } else {
                console.error("Unexpected response status during login:", request.status);
                throw new Error("Login failed");
            }
        } catch (err) {
            console.error("Error during login:", err.response?.data || err.message);
            throw err;
        }
    };

    // Get User History
    const getHistoryOfUser = async () => {
        try {
            console.log(`Get user history request to ${client.defaults.baseURL}/get_all_activity`);
            const request = await client.get("/get_all_activity", {
                params: {
                    token: localStorage.getItem("token"),
                },
            });
            return request.data;
        } catch (err) {
            console.error("Error fetching user history:", err.response?.data || err.message);
            throw err;
        }
    };

    // Add to User History
    const addToUserHistory = async (meetingCode) => {
        try {
            console.log(`Add to user history request to ${client.defaults.baseURL}/add_to_activity`);
            const request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode,
            });
            return request.data;
        } catch (err) {
            console.error("Error adding to user history:", err.response?.data || err.message);
            throw err;
        }
    };

    const data = {
        userData,
        setUserData,
        addToUserHistory,
        getHistoryOfUser,
        handleRegister,
        handleLogin,
    };

    return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};
