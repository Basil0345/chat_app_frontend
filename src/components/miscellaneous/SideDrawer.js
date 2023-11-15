import { Box, Button, Text, Tooltip, Menu, MenuButton, MenuList, Avatar, MenuItem, MenuDivider, useDisclosure, Input, useToast, Spinner } from '@chakra-ui/react';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import React, { useState } from 'react'
import { ChatState } from './../../Context/ChatProvider';
import ProfileModel from './ProfileModel';
import { useNavigate } from 'react-router-dom';
import {
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
} from '@chakra-ui/react'
import axios from 'axios';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogics';
import NotificationBadge, { Effect } from 'react-notification-badge';


const SideDrawer = () => {
    const navigate = useNavigate()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const btnRef = React.useRef()
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState()

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        navigate("/");
    }
    const toast = useToast()
    const handleSubmit = async () => {
        if (!search) {
            toast({
                title: "Please Enter something in search",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-left"
            })
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
            const { data } = await axios.get(`/api/user?search=${search}`, config)
            setLoading(false);
            setSearchResult(data);

        } catch (error) {
            toast({
                title: "Error Occured!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-left"
            })
        }
    }

    const accessChat = async (userId) => {
        try {
            setLoadingChat(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`
                }
            }
            const { data } = await axios.post("/api/chat", { userId }, config);

            if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
            setLoadingChat(false);
            setSelectedChat(data);
            onClose();
        } catch (error) {
            toast({
                title: "Error in fetching the chat",
                status: error.message,
                duration: 5000,
                isClosable: true,
                position: "top-left"
            })
        }
    }

    return (
        <>
            <Box display="flex" justifyContent="space-between" alignItems="center" bg="white" w="100%" p="5px 10px 5px 10px" borderWidth="5px">
                <Tooltip label="Search User to chat" hasArrow placement='bottom-end'>
                    <Button variant="ghost" ref={btnRef} onClick={onOpen}>
                        <i className='fas fa-search'></i>
                        <Text display={{ base: "none", md: "flex" }} px="4">Search User</Text>
                    </Button>
                </Tooltip>
                <Text fontSize="2xl" fontFamily="Work sans">WhatzApp</Text>

                <div>
                    <Menu>
                        <MenuButton p={1}>
                            <NotificationBadge count={notification.length} effect={Effect.SCALE} />
                            <BellIcon fontSize="2xl" m={1} />
                        </MenuButton>
                        <MenuList pl={2}>
                            {!notification.length && "No New Messages"}
                            {notification.map((notif) => {
                                return <MenuItem key={notif._id} onClick={() => {
                                    setSelectedChat(notif.chat)
                                    setNotification(notification.filter((notifi) => {
                                        return notif._id !== notifi._id;
                                    }))
                                }}>
                                    {notif.chat.isGroupChat ? `New Message in ${notif.chat.chatName} ` :
                                        `New Message from ${getSender(user, notif.chat.users)}`}
                                </MenuItem>
                            })}
                        </MenuList>
                    </Menu>
                </div>

                <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                        <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic} />
                    </MenuButton>
                    <MenuList>
                        <ProfileModel user={user}>
                            <MenuItem>My Profile</MenuItem>
                        </ProfileModel>
                        <MenuDivider />
                        <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                    </MenuList>
                </Menu>
            </Box>

            <Drawer
                isOpen={isOpen}
                placement='left'
                onClose={onClose}
                finalFocusRef={btnRef}
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>

                    <DrawerBody>
                        <Box display="flex" pb={2}>
                            <Input placeholder="Search by name or email" mr={2} value={search} onChange={(e) => setSearch(e.target.value)} />
                            <Button
                                onClick={handleSubmit}
                            >Go</Button>
                        </Box>
                        {loading ? (<ChatLoading />) : (
                            searchResult?.map(user => <UserListItem key={user._id} user={user} handleFunction={() => accessChat(user._id)} />)
                        )}
                        {loadingChat && <Spinner ml="auto" display="flex" />}
                    </DrawerBody >
                </DrawerContent>
            </Drawer>
        </>
    )
}

export default SideDrawer
