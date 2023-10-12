import axios from 'axios';
import {SERVER_BASE_URL} from ".//constant";


export const userAPI = {
    get: async () => {
        const token = window.localStorage.getItem("token");

        try {
            const response = await axios.get(`${SERVER_BASE_URL}/user/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        } catch (error) {
            return error.response;
        }
    },
    search: async (searchString) => {
        const token = window.localStorage.getItem("token");

        try {
            const response = await axios.get(`${SERVER_BASE_URL}/user/search?searchString=${searchString}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        } catch (error) {
            return error.response;
        }
    },
    put: async (payload) => {
        const token = window.localStorage.getItem("token");

        try {
            const response = await axios.put(`${SERVER_BASE_URL}/user`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    'Access-Control-Allow-Origin': '*',
                },
            });
            return response.data;
        } catch (error) {
            return error.response;
        }
    },
};

export const messagesAPI = {
    getMessageList: async () => {
        const token = window.localStorage.getItem("token");

        try {
            const response = await axios.get(`${SERVER_BASE_URL}/message/0/10`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        } catch (error) {
            return error.response;
        }
    },
    getMessagesBetweenUsers: async (userId) => {
        const token = window.localStorage.getItem("token");

        try {
            const response = await axios.get(`${SERVER_BASE_URL}/message/${userId}/0/10`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        } catch (error) {
            return error.response;
        }
    },
    postMessage: async (sentTo, message) => {
        const token = window.localStorage.getItem("token");

        try {
            const response = await axios.post(`${SERVER_BASE_URL}/message`, {sentTo, message}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        } catch (error) {
            return error.response;
        }
    },
};