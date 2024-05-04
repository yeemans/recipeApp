import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Login.css"

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
        <div className="page-container">
        <div className="login-container">
            <div className="welcome-container">
            <img class="logo" src="https://www.svgrepo.com/show/76009/chef-hat-outline-symbol.svg"/>
            </div>
            <div className="form-container">
                <p>{errorMessage}</p>
                <input id="usernameInput" 
                    placeholder="Username"
                    type="text" 
                    onChange={(e) => setUsername(e.target.value)} 
                    value={username} />
            </div>

            <div className="form-container">
                <input id="passwordInput" 
                    placeholder="Password"
                    type="password" 
                    onChange={(e) => setPassword(e.target.value)} 
                    value={password} />
            </div>

            <div className="button-container">
                <button className="login-button" onClick={(e) => loginUser()}>Login</button>
            </div>
            <div className="button-container">
            <button className="register-button" onClick={() => {return navigate('/register')} }>Register</button>
            </div>
           
        </div>
        </div>
    )
}

export default Login;