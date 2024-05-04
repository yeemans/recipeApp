import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
    useEffect(() => {
        checkLoggedIn();
    }, [])

    let [username, setUsername] = useState("");
    let [password, setPassword] = useState("");
    let [errorMessage, setErrorMessage] = useState("");
    let navigate = useNavigate();

    async function checkLoggedIn() { 
        let result = await axios.post("http://localhost:5000/logged_in", {
            username: localStorage.getItem("recipeAppUsername"),
            session_token: localStorage.getItem("recipeAppSession"),
        });

        let profileLink = `/profile/${localStorage.getItem("recipeAppUsername")}`;
        if (result["data"]["success"]) return navigate(profileLink);
    }
    
    async function loginUser() {
        let result = await axios.post("http://localhost:5000/login", {
            username: username,
            password: password,
        });

        if (result["data"]["success"]) {
            // set session token and go to homepage
            localStorage.setItem("recipeAppSession", result["data"]["session_token"])
            localStorage.setItem("recipeAppUsername", username);
            return navigate(`/profile/${username}`);
        }
        setErrorMessage(result["data"]["message"])
    }

    return (
        <div>
            <div>
                <p>{errorMessage}</p>
                <label htmlFor="usernameInput">Username:</label>
                <input id="usernameInput" 
                    type="text" 
                    onChange={(e) => setUsername(e.target.value)} 
                    value={username} />
            </div>

            <div>
                <label htmlFor="passwordInput">Password:</label>
                <input id="passwordInput" 
                    type="password" 
                    onChange={(e) => setPassword(e.target.value)} 
                    value={password} />
            </div>

            <button onClick={(e) => loginUser()}>Login</button>
            <button onClick={() => {return navigate('/register')} }>Register</button>
        </div>
    )
}

export default Login;