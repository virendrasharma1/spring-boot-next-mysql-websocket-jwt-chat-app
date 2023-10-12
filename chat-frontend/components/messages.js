'use client'

import {useCallback, useEffect, useReducer, useRef, useState} from "react";
import {messagesAPI, userAPI} from "@/utils/api";
import useSWR from "swr";
import storage from "@/utils/storage";
import {SOCKET_URL} from "@/utils/constant";
import {Client} from '@stomp/stompjs';
import Spinner from "@/components/Spinner";
import AutoSuggest from 'react-autosuggest';

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
    const [suggestions, setSuggestions] = useState([{name: "Virendra"}, {name: "neha"}])
    const [activeChat, setActiveChat] = useState({});
    const [message, setMessage] = useState("");
    const [searchUsers, setSearchUsers] = useState([]);
    const {data: currentUser, isLoading, isError} = useSWR("user", storage);
    const [state, dispatch] = useReducer(reducer, initialState);


    const [autoSuggestValue, setAutoSuggestValue] = useState("");

    function getSuggestions(autoSuggestValue) {
        let res = [];
        const inputValue = autoSuggestValue.trim().toLowerCase();
        const inputLength = inputValue.length;

        if (inputValue && inputLength > 0) {
            return searchUsers;
        }

        return res;
    }

    if (isLoading) return <Spinner/>

    const userId = currentUser?.userId;

    useEffect(() => {
        messagesAPI.getMessageList()
            .then((data) => {
                setMessageList(data);
                getAllMessagesHandler(data[0]);
            })
    }, [])

    const getAllMessagesHandler = (message) => {
        setActiveChat(message);
        messagesAPI.getMessagesBetweenUsers(message["chatRecipientId"])
            .then((data) => {
                setActiveUserMessages(data.reverse());
            })
    }

    const sendMessageHandler = () => {
        messagesAPI.postMessage(activeChat["chatRecipientId"], message)
            .then((data) => {
                setActiveUserMessages(prevState => [...prevState, data]);
                setMessage("");
            })
    }

    const onChangeHandler = (e) => {
        userAPI.search(e.target.value).then((users) => {
            setSearchUsers(users);
        })
    }

    useEffect(() => {
        console.log(state);
        console.log(activeChat);
        if (state) {
            if (messageList.some((message) => message["id"] === state["id"])) {
                setMessageList(prevData => {
                    return prevData.map(item => {
                        if (item["chatRecipientId"] === state["chatRecipientId"]) {
                            return {...item, message: state.message};
                        }
                        return item;
                    });
                });
            } else {
                setMessageList(prevState => [...prevState, state]);
            }
            if (activeChat["chatRecipientId"] === state["chatRecipientId"]) {
                const newMessage = {
                    status: state.status,
                    sentBy: state.chatRecipientId,
                    sentTo: state.userId,
                    message: state.message,
                    messageId: state.messageId
                };
                setActiveUserMessages(prevState => [...prevState, newMessage])
            }
        }
        console.log("Active chat", activeChat);
    }, [state])

    const onSuggestionSelectedHandler = (event, {suggestion, suggestionValue, index, method}) => {
        event.preventDefault();
        messagesAPI.postMessage(suggestion["userId"], `Hello ${suggestion.name}`)
            .then((data) => {
                setActiveUserMessages(prevState => [...prevState, data]);
                setAutoSuggestValue("");
                messagesAPI.getMessageList()
                    .then((data) => {
                        setMessageList(data);
                    })
            })
        console.log('ping... ', suggestion)
    }

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


    return (
        <div className="min-w-full border rounded lg:grid lg:grid-cols-3">
            <div className="border-r border-gray-300 lg:col-span-1">
                <AutoSuggest
                    suggestions={suggestions}
                    onSuggestionsClearRequested={() => setSuggestions([])}
                    onSuggestionsFetchRequested={({value}) => {
                        setAutoSuggestValue(value);
                        setSuggestions(getSuggestions(value));
                    }}
                    onSuggestionSelected={onSuggestionSelectedHandler}
                    getSuggestionValue={suggestion => suggestion.name}
                    renderSuggestion={suggestion => <span>{suggestion.name}</span>}
                    inputProps={{
                        placeholder: "Send hello to users",
                        value: autoSuggestValue,
                        onChange: onChangeHandler
                    }}
                    highlightFirstSuggestion={true}
                />

                <ul
                    className="overflow-auto h-[32rem]" key={message["messageId"]}>
                    <h2 className="my-2 mb-2 ml-2 text-lg text-gray-600">Chats</h2>
                    {messageList.map(message =>
                        <li onClick={() => getAllMessagesHandler(message)}>
                            <a className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out bg-gray-100 border-b border-gray-300 cursor-pointer focus:outline-none">
                                <div className="w-full pb-2">
                                    <div className="flex justify-between">
                                            <span
                                                className="block ml-2 font-semibold text-gray-600">{message["chatRecipientName"]}</span>
                                    </div>
                                    <span
                                        className="block ml-2 text-sm text-gray-600">{message["message"]}</span>
                                </div>
                            </a>
                        </li>
                    )}
                </ul>

            </div>
            <div className="hidden lg:col-span-2 lg:block">
                <div className="w-full">
                    <div className="relative flex items-center p-3 border-b border-gray-300">
                                <span
                                    className="block ml-2 font-bold text-gray-600">{activeChat?.chatRecipientName}</span>
                    </div>
                    <div className="relative w-full p-6 overflow-y-auto h-[40rem]">
                        <ul className="space-y-2">
                            {activeUserMessages.map(activeMessage =>
                                <li className={`flex ${userId === activeMessage["sentBy"] ? "justify-start" : "justify-end"}`}
                                    key={activeMessage["messageId"]}>
                                    <div
                                        className="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow">
                                        <span className="block">{activeMessage.message}</span>
                                    </div>
                                </li>)
                            }

                        </ul>
                    </div>

                    <div className="flex items-center justify-between w-full p-3 border-t border-gray-300">

                        <input type="text" placeholder="Message"
                               className="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
                               value={message}
                               onChange={(e) => {
                                   setMessage(e.target.value)
                               }}
                               name="message" required/>
                        <button type="submit">
                            <svg className="w-5 h-5 text-gray-500 origin-center transform rotate-90"
                                 xmlns="http://www.w3.org/2000/svg"
                                 onClick={sendMessageHandler}
                                 viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Messages;