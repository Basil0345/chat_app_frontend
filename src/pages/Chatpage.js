import React, { useEffect, useState } from 'react';
import axios from "axios";

const Chatpage = () => {
    const [chats, setChats] = useState([]);
    const fetchChats = async () => {
        let { data } = await axios.get("/api/chats");
        console.log(data);
        setChats(data);
    }
    useEffect(() => {
        fetchChats();

    }, [])
    return (
        <div>
            <h1>Chat page</h1>
            {chats.map((chat) => {
                return <div key={chat._id}>{chat.chatName}</div>
            })}
        </div>
    )
}

export default Chatpage
