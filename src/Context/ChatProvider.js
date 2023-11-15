import { createContext, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
    const [user, setUser] = useState();
    const [selectedChat, setSelectedChat] = useState();
    const [chats, setChats] = useState([])
    const [notification, setNotification] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        let userInfo = JSON.parse(localStorage.getItem("userInfo"));
        setUser(userInfo)
        if (!userInfo) {
            navigate("/");
        } else {
            navigate("/chat");
        }
    }, [])

    return (
        <ChatContext.Provider
            value={{
                user,
                selectedChat,
                chats,
                setUser,
                setSelectedChat,
                setChats,
                notification,
                setNotification
            }}>
            {children}
        </ChatContext.Provider>
    )
}

export const ChatState = () => {
    return useContext(ChatContext);
}

export default ChatProvider;