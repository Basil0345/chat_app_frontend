import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VStack, FormControl, FormLabel, Input, InputGroup, Button, InputRightElement, } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/react';
import axios from "axios";



const Login = () => {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useToast()
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleClick = () => {
        setShow(!show);
    }

    const submitHandler = async () => {
        setLoading(true);
        const { email, password } = form;
        if (!email || !password) {
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
        try {
            const config = {
                headers: {
                    "Content-type": "application/json"
                }
            };
            const { data } = await axios.post("/api/user/login", { ...form }, config);
            toast({
                title: "Login Successful",
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
                title: error.response.data,
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

            <FormControl id='email' isRequired>
                <FormLabel>
                    Email
                </FormLabel>
                <Input
                    name='email'
                    value={form.email}
                    type='email'
                    placeholder='Enter Your Email'
                    onChange={handleChange}
                />
            </FormControl>

            <FormControl id='password' isRequired>
                <FormLabel>
                    Password
                </FormLabel>
                <InputGroup>
                    <Input
                        name='password'
                        value={form.password}
                        type={show ? "text" : "password"}
                        placeholder='Enter Your Password'
                        onChange={handleChange}
                    />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <Button colorScheme='blue'
                width="100%"
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={loading}
            >
                Login
            </Button>

            <Button variant="solid" colorScheme='red'
                width="100%"
                style={{ marginTop: 15 }}
                onClick={() => {
                    setForm({ email: "guest@example.com", password: "hello123" })
                }}
            >
                Get User Credentials
            </Button>
        </VStack>
    )
}

export default Login;
