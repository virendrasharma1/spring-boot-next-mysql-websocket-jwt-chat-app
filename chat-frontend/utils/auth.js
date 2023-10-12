import axios from 'axios';
import { SERVER_BASE_URL } from "./constant";


export const loginUser = async (payload) => {
    try {
        const response = await axios.post(`${SERVER_BASE_URL}/auth/signin`, payload)
        return response.data;
    } catch (err) {
        return err.message;
    }
};

export const registerUser = async (payload) => {
    try {
        const response = await axios.post(`${SERVER_BASE_URL}/auth/signup`, payload)
        return response.data;
    } catch (err) {
        return err.message;
    }
};