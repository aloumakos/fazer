import axios from "../api/axios";
import { User } from "../api/User";

const REGISTER_URL = "/register";

export const login = async (user: User) => {
    try {
        const response = await axios.post(
            REGISTER_URL,
            JSON.stringify({ user }),
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );
        console.log("Registered!", response.data) ; 
    } catch (error: any) {
        if (!error?.response) {
            console.log("No Server Response");
        } else if (error.response?.status === 409) {
            console.log("Username Taken");
        } else {
            console.log("Registration Failed");
        }
    }
}