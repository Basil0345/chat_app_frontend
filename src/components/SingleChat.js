import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react'
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from './../config/ChatLogics';
import ProfileModel from './miscellaneous/ProfileModel';
import UpdateGroupChatModel from './miscellaneous/UpdateGroupChatModel';
import axios from 'axios';
import "./styles.css";
import ScrollableChat from './ScrollableChat';
import io from "socket.io-client"
import Lottie from "react-lottie"
import animationData from "../animations/typing.json"

const ENDPOINT = "http://localhost:5000";

let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");

    const [socketConnected, setSocketConnected] = useState(false);

    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const toast = useToast();

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

    useEffect(() => {
        socket = io(ENDPOINT) //to connect 
        socket.emit("setup", user); //to join room
        socket.on("connected", () => {
            setSocketConnected(true);
        })
        socket.on("typing", () => {
            setIsTyping(true)
        })
        socket.on("stop typing", () => {
            setIsTyping(false)
        })
    }, [])


    const sendMessage = async (e) => {
        if (e.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id)
            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`
                    }
                }
                const { data } = await axios.post("/api/message", { content: newMessage, chatId: selectedChat._id }, config);
                console.log(data);
                socket.emit("new message", data)
                setNewMessage("");
                setFetchAgain(!fetchAgain)
                setMessages([...messages, data]);
            } catch (error) {
                toast({
                    title: "Error Occured!",
                    description: "Failed to send the Message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "top-left"
                })
            }
        }
    }

    const fetchMessages = async () => {
        if (!selectedChat) return
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
            setLoading(true);
            const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
            setMessages(data);
            setLoading(false);

            socket.emit("join chat", selectedChat._id);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-left"
            })
            setLoading(false);
        }
    }

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    useEffect(() => {
        fetchMessages()
        selectedChatCompare = selectedChat
    }, [selectedChat])


    useEffect(() => {
        socket.on("message recieved", (newMessageRecieved) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
                //give notification
                if (!notification.includes(newMessageRecieved)) {
                    setNotification([newMessageRecieved, ...notification])
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages([...messages, newMessageRecieved])
                setFetchAgain(!fetchAgain)
            }
        })
    })

    useEffect(() => {
        console.log("useEffect test")
    })

    return (
        <>
            {selectedChat ? (<>
                <Text fontSize={{ base: "28px", md: "30px" }}
                    pb={3}
                    px={2}
                    w="100%"
                    fontFamily="Work sans"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <IconButton
                        display={{ base: "flex", md: "none" }}
                        icon={<ArrowBackIcon />}
                        onClick={() => { setSelectedChat() }}
                    />
                    {!selectedChat?.isGroupChat ? (<>
                        {getSender(user, selectedChat.users)}
                        <ProfileModel user={getSenderFull(user, selectedChat.users)} />
                    </>) : (<>
                        {selectedChat.chatName.toUpperCase()}
                        <UpdateGroupChatModel fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
                    </>)}
                </Text>
                <Box
                    display="flex"
                    flexDir="column"
                    justifyContent="flex-end"
                    p={3}
                    bg="#E8E8E8"
                    w="100%"
                    h="100%"
                    borderRadius="lg"
                    overflowY="hidden"
                >
                    {loading ? (
                        <Spinner
                            size="xl"
                            w={20}
                            h={20}
                            alignSelf="center"
                            margin="auto"
                        />
                    ) : (<div className='messages'> <ScrollableChat messages={messages} /></div>)}
                    <FormControl onKeyDown={sendMessage} isRequired mt={3}>

                        {isTyping ? <div><Lottie options={defaultOptions} width={60} style={{ marginBottom: 15, marginLeft: 0 }} /></div> : (<div></div>)}
                        < Input variant="filled" bg="#E0E0E0" placeholder='Enter a message..'
                            onChange={typingHandler}
                            value={newMessage}
                        />
                    </FormControl>
                </Box>
            </>) : (
                <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                    <Text fontSize="3xl" pb={3} fontFamily="Work sans">Click on a user to start chatting</Text>
                </Box>
            )
            }
        </>
    )
}

export default SingleChat
