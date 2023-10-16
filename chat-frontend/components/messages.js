'use client'

import {useCallback, useEffect, useReducer, useRef, useState} from "react";
import {messagesAPI, userAPI} from "@/utils/api";
import useSWR from "swr";
import storage from "@/utils/storage";
import {SOCKET_URL} from "@/utils/constant";
import {Client} from '@stomp/stompjs';
import Spinner from "@/components/Spinner";
import AutoSuggest from 'react-autosuggest';
import _ from 'lodash';
import {AutoComplete} from "@/components/AutoComplete";

const initialState = null;

function reducer(state, action) {
    switch (action.type) {
        case 'UPDATE_MESSAGE':
            return action.payload;
        default:
            return state;
    }
}

const Messages = () => {
    const [messageList, setMessageList] = useState([])
    const [activeUserMessages, setActiveUserMessages] = useState([])
    const [activeChat, setActiveChat] = useState({});
    const [message, setMessage] = useState("");
    const {data: currentUser, isLoading, isError} = useSWR("user", storage);
    const [state, dispatch] = useReducer(reducer, initialState);


    if (isLoading) return <Spinner/>

    const userId = currentUser?.userId;

    useEffect(() => {
        messagesAPI.getMessageList()
            .then((data) => {
                if (data.length > 0) {
                    setMessageList(data);
                    getAllMessagesHandler(data[0]);
                }
            })
    }, [])

    const updateMessageStatus = (message) => {
        messagesAPI.updateClientMessageStatus(message["latestMessageUserId"]).then((response) => {
            setMessageList(prevData => {
                return prevData.map((item, index) => {
                    if (item["correspondUserId"] === message["correspondUserId"]) {
                        return {...item, status: "R"};
                    }
                    return item;
                });
            });
        });
    }

    const getAllMessagesHandler = (message) => {
        if (!_.isEmpty(message)) {
            if (message.status === "U") updateMessageStatus(message);
            setActiveChat(message);
            messagesAPI.getMessagesBetweenUsers(message["correspondUserId"])
                .then((data) => {
                    setActiveUserMessages(data.reverse());
                })
        }
    }

    const sendMessageHandler = () => {
        messagesAPI.postMessage(activeChat["correspondUserId"], message)
            .then((data) => {
                setActiveUserMessages(prevState => [...prevState, data]);
                setMessageList(prevData => {
                    return prevData.map((item, index) => {
                        if (item["correspondUserId"] === activeChat["correspondUserId"]) {
                            return {...item, message: message};
                        }
                        return item;
                    });
                });
                setMessage("");
            })
    }

    useEffect(() => {
        if (state) {
            // If left side tab of messages already exists then push it to top
            if (messageList.some((message) => message["correspondUserId"] === state["correspondUserId"])) {
                setMessageList(prevData => {
                    let newChat = [...prevData];
                    const index = newChat.findIndex((item) => item.correspondUserId === state.correspondUserId);
                    if (index !== -1) {
                        newChat.splice(index, 1);
                        newChat = [state, ...newChat];
                    }
                    return newChat;
                });
            } else {
                // If messageList is empty and someone is receiving message for the first time we push it to right tab as well
                if (messageList.length === 0) {
                    const newMessage = {
                        status: state.status,
                        sentBy: state.correspondUserId,
                        correspondUserId: state.correspondUserId,
                        sentTo: state.userId,
                        message: state.message,
                        messageId: state.messageId
                    };

                    setActiveChat({
                        chatRecipientName: state.chatRecipientName,
                        correspondUserId: state.correspondUserId,
                        latestMessageUserId: state.latestMessageUserId
                    });
                    setActiveUserMessages(prevState => [...prevState, newMessage])
                    setMessageList(prevState => [...prevState, {...state}]);
                } else {
                    // New user comes and sends text
                    setMessageList(prevState => [state, ...prevState]);
                }
            }
            if (messageList.length > 0) {
                if (activeChat["correspondUserId"] === state["correspondUserId"]) {
                    const newMessage = {
                        status: state.status,
                        sentBy: state.correspondUserId,
                        correspondUserId: state.correspondUserId,
                        sentTo: state.userId,
                        message: state.message,
                        messageId: state.messageId
                    };
                    setActiveUserMessages(prevState => [...prevState, newMessage])
                }
            }
        }
    }, [state])


    useEffect(() => {
        let onConnected = () => {
            client.subscribe("/user/" + userId + "/reply", (msg) => {
                if (msg.body) {
                    const jsonBody = JSON.parse(msg.body);
                    if (jsonBody.message) {
                        dispatch({type: 'UPDATE_MESSAGE', payload: jsonBody});
                        // updateLatestMessage(jsonBody);
                    }
                }
            });
        }

        let onDisconnected = () => {
            console.log("Disconnected!!")
        }

        const client = new Client({
            brokerURL: SOCKET_URL,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: onConnected,
            onDisconnect: onDisconnected
        });
        client.activate();
        return () => {
            client.forceDisconnect();
        }
    }, [])


    const autoCompleteCallback = (prop) => {
        const {suggestion, suggestionValue, index, method} = prop;
        messagesAPI.postMessage(suggestion["userId"], `Hello ${suggestion.name}`)
            .then((data) => {
                setActiveUserMessages(prevState => [...prevState, data]);
                messagesAPI.getMessageList()
                    .then((data) => {
                        setMessageList(data);
                    })
            })
    }

    return (
        <div className="flex h-screen antialiased text-gray-800">
            <div className="flex flex-row h-full w-full overflow-x-hidden">
                <div className="flex flex-col py-8 pl-6 pr-2 w-64 bg-white flex-shrink-0">
                    <div className="flex flex-row items-center justify-center h-12 w-full">
                        <div
                            className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                ></path>
                            </svg>
                        </div>
                        <div className="ml-2 font-bold text-2xl">My Chats</div>
                    </div>
                    <div
                        className="flex flex-col items-center bg-indigo-100 border border-gray-200 mt-4 w-full py-6 px-4 rounded-lg">
                        <div className="text-sm font-semibold mt-2">{currentUser?.name}</div>
                        <div className="flex flex-row items-center mt-3">
                            <div className="flex flex-col justify-center h-4 w-8 bg-indigo-500 rounded-full">
                                <div className="h-3 w-3 bg-white rounded-full self-end mr-1">

                                </div>
                            </div>
                            <div className="leading-none ml-1 text-xs">Active</div>
                        </div>
                    </div>


                    <div className="flex flex-col mt-8">
                        <div className="relative w-full">
                            <AutoComplete autoCompleteCallback={autoCompleteCallback}/>
                        </div>
                    </div>


                    <div className="flex flex-col mt-4">

                        <div className="flex flex-row items-center justify-between text-xs">
                            <span className="font-bold">Active Conversations</span>
                        </div>
                        <div className="flex flex-col space-y-1 mt-4 -mx-2 h-100 overflow-y-auto">
                            {messageList?.map(message =>
                                <div key={message["messageId"]} onClick={() => getAllMessagesHandler(message)}>
                                    <button className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2">
                                        <div
                                            className="flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full">
                                            {message["chatRecipientName"].substring(0, 1)}
                                        </div>
                                        <div className="ml-2 text-sm font-semibold">{message["chatRecipientName"]}</div>
                                        {message["status"] === "U" && message["latestMessageUserId"] !== userId ?
                                            <div
                                                className="flex items-center ml-3 justify-center text-xs text-white bg-red-500 h-4 w-8 rounded leading-none">
                                                New
                                            </div> : null}
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
                <div className="flex flex-col flex-auto h-full p-6">
                    <div
                        className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4"
                    >
                        <div className="flex flex-col h-full overflow-x-auto mb-4">
                            <div className="flex flex-col h-full">
                                <div className="grid grid-cols-12 gap-y-2">
                                    {activeUserMessages.map(message =>
                                        <div key={message["messageId"]}
                                             className={`${userId === message["sentBy"] ? "col-start-6 col-end-13" : "col-start-1 col-end-8"} p-3 rounded-lg`}>
                                            <div
                                                className={`${userId === message["sentBy"] ? "flex items-center justify-start flex-row-reverse" : "flex flex-row items-center"}`}>
                                                <div
                                                    className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                                                    {userId === message["sentBy"] ? currentUser?.name.substring(0, 1) : activeChat["chatRecipientName"] ? activeChat["chatRecipientName"].substring(0, 1) : "U"}
                                                </div>
                                                <div
                                                    className={`${userId === message["sentBy"] ? "mr-3 bg-indigo-100" : "ml-3 bg-white"} relative text-sm py-2 px-4 shadow rounded-xl`}>
                                                    <div>{message.message}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
                            <div>
                                <button className="flex items-center justify-center text-gray-400 hover:text-gray-600">
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13">
                                        </path>
                                    </svg>
                                </button>
                            </div>
                            <div className="flex-grow ml-4">
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => {
                                            setMessage(e.target.value)
                                        }}
                                        className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
                                    />
                                    <button type="button"
                                            className="absolute flex items-center justify-center h-full w-12 right-0 top-0 text-gray-400 hover:text-gray-600">
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                                            </path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="ml-4">
                                <button
                                    onClick={sendMessageHandler}
                                    className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0">
                                    <span>Send</span>
                                    <span className="ml-2">
                                            <svg
                                                className="w-4 h-4 transform rotate-45 -mt-px"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8">
                                            </path>
                                            </svg>
                                            </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Messages;