import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VStack, FormControl, FormLabel, Input, InputGroup, Button, InputRightElement } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/react';
import axios from "axios";


const Signup = () => {
    const toast = useToast()
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [pic, setPic] = useState("");
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        confirmpassword: "",
        password: ""
    });

    const handleImage = (pics) => {
        setLoading(true);
        if (pics === undefined) {
            toast({
                title: 'Please Select an Image',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            return;
        }
        if (pics.type === "image/jpeg" || pics.type === "image/png") {
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "chat-app");
            data.append("cloud_name", "di6wkxcto");
            fetch("https://api.cloudinary.com/v1_1/di6wkxcto/image/upload", {
                method: "post",
                body: data,
            })
                .then((res) => res.json())
                .then((data) => {
                    setPic(data.url.toString());
                    console.log(data.url.toString());
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                    setLoading(false);
                });
        } else {
            toast({
                title: "Please Select an Image!",
                status: "warning",
                duration: "5000",
                isClosable: true,
                position: "bottom",
            })
            setLoading(false);
            return;
        }
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        console.log(form);
    }

    const handleClick = () => {
        setShow(!show);
    }

    const submitHandler = async () => {
        setLoading(true);
        const { name, email, password, confirmpassword } = form;
        if (!name || !email || !password || !confirmpassword) {
            toast({
                title: "Please Fill all the Fields",
                status: "warning",
                duration: "5000",
                isClosable: true,
                position: "top",
            })
            setLoading(false);
            return;
        }
        if (password !== confirmpassword) {
            toast({
                title: "Password doesn't match",
                status: "warning",
                duration: "5000",
                isClosable: true,
                position: "top",
            })
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    "Content-type": "application/json"
                }
            };
            const { data } = await axios.post("/api/user", { ...form, pic }, config);
            toast({
                title: "Registration Successful",
                status: "success",
                duration: "5000",
                isClosable: true,
                position: "top",
            })
            localStorage.setItem("userInfo", JSON.stringify(data));

            setLoading(false);
            navigate("/chat");
        } catch (error) {
            toast({
                title: "Error Occured!",
                status: "error",
                duration: "5000",
                isClosable: true,
                position: "top",
            })
            setLoading(false);
        }
    }

    return (
        <VStack spacing="5px" color="black">

            <FormControl id='first-name' isRequired>
                <FormLabel>
                    Name
                </FormLabel>
                <Input
                    name='name'
                    placeholder='Enter Your Name'
                    onChange={(e) => {
                        handleChange(e);
                    }}
                />
            </FormControl>

            <FormControl id='email' isRequired>
                <FormLabel>
                    Email
                </FormLabel>
                <Input
                    name='email'
                    type='email'
                    placeholder='Enter Your Email'
                    onChange={(e) => {
                        handleChange(e);
                    }}
                />
            </FormControl>

            <FormControl id='password' isRequired>
                <FormLabel>
                    Password
                </FormLabel>
                <InputGroup>
                    <Input
                        name='password'
                        type={show ? "text" : "password"}
                        placeholder='Enter Your Password'
                        onChange={(e) => {
                            handleChange(e);
                        }}
                    />
                    <InputRightElement width="4.5rem">
                        <Button onClick={handleClick} h="1.75rem" size="sm">
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <FormControl id='confirmpassword' isRequired>
                <FormLabel>
                    Confirm Password
                </FormLabel>
                <InputGroup>
                    <Input
                        name='confirmpassword'
                        type={show ? "text" : "password"}
                        placeholder='Confirm Your Password'
                        onChange={(e) => {
                            handleChange(e);
                        }}
                    />
                    <InputRightElement width="4.5rem">
                        <Button onClick={handleClick} h="1.75rem" size="sm">
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <FormControl id='pic' isRequired>
                <FormLabel>
                    Picture
                </FormLabel>
                <Input
                    name='pic'
                    type='file'
                    p={1.5}
                    accept='image/*'
                    onChange={(e) => {
                        handleImage(e.target.files[0])
                    }}
                />
            </FormControl>

            <Button colorScheme='blue'
                width="100%"
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={loading}
            >
                SignUp
            </Button>
        </VStack>
    )
}

export default Signup
