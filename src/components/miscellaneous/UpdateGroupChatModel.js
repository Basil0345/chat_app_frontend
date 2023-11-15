import { ViewIcon } from '@chakra-ui/icons'
import { Box, Button, FormControl, IconButton, Input, Spinner, useDisclosure, useToast } from '@chakra-ui/react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'
import { ChatState } from '../../Context/ChatProvider'
import { useState } from 'react'
import UserBadgeItem from '../UserAvatar/UserBadgeItem'
import axios from 'axios'
import UserListItem from '../UserAvatar/UserListItem'

const UpdateGroupChatModel = ({ fetchAgain, setFetchAgain }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [groupChatName, setGroupChatName] = useState("");
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameloading, setRenameloading] = useState(false);
    const { selectedChat, setSelectedChat, user } = ChatState()

    const 
    handleRemove = async (u) => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }

            if (selectedChat.groupAdmin._id !== user._id && u._id !== user._id) { //no admin and not same user
                toast({
                    title: "Only Admin can remove someone!",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "top-left"
                })
                setLoading(false);
                return
            }

            const { data } = await axios.put("/api/chat/groupremove", { chatId: selectedChat._id, userId: u._id }, config)
            u._id === user._id ? setSelectedChat() : setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-left"
            })
            setLoading(false);
        }
    }

    const handleRename = async () => {
        if (!groupChatName) return
        try {
            setRenameloading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
            const { data } = await axios.put("api/chat/rename", { chatId: selectedChat._id, chatName: groupChatName }, config);
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameloading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-left"
            })
            setRenameloading(false);
        }
        setGroupChatName("");
    }

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            return
        }
        try {
            setLoading(true)
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
            const { data } = await axios.get(`api/user?search=${query}`, config)
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-left"
            })
        }
    }

    const handleAddUser = async (user1) => {

        if (selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: "Only Admin can add someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-left"
            })
            return
        }

        if (selectedChat.users.find((u) => u._id === user1._id)) {
            toast({
                title: "User Already in group!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-left"
            })
            return
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
            const { data } = await axios.put("api/chat/groupadd", { chatId: selectedChat._id, userId: user1._id }, config);
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-left"
            })
            setLoading(false);
        }
    }


    const toast = useToast()
    return (
        <>
            <IconButton display={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader fontSize="35px" fontFamily="Work sans" display="flex" justifyContent="center">{selectedChat?.chatName}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box display="flex" flexWrap="wrap" w="100%" pb={3}>
                            {selectedChat.users.map((u) => <UserBadgeItem key={u._id} user={u} handleFunction={() => handleRemove(u)} />)}
                        </Box>
                        <FormControl display="flex">
                            <Input placeholder='Chat Name' mb={3} value={groupChatName} onChange={(e) => setGroupChatName(e.target.value)} />
                            <Button variant="solid" colorScheme='teal' ml={1} isLoading={renameloading} onClick={handleRename} >Update</Button>
                        </FormControl>
                        <FormControl display="flex">
                            <Input placeholder='Add User to group' mb={1} onChange={(e) => handleSearch(e.target.value)} />
                        </FormControl>
                        {loading ? (<Spinner size="lg" />) : (
                            searchResult?.slice(0, 4).map(user => (<UserListItem key={user._id} user={user} handleFunction={() => handleAddUser(user)} />))
                        )}

                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='red' mr={3} onClick={() => { handleRemove(user) }}>
                            Leave Group
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default UpdateGroupChatModel
