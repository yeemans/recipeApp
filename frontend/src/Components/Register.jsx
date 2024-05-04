import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
    let [username, setUsername] = useState("");
    let [password, setPassword] = useState("");
    let [errorMessage, setErrorMessage] = useState("");
    let navigate = useNavigate();
    
    async function registerUser() {
        let result = await axios.post("http://localhost:5000/register", {
            username: username,
            password: password,
        });

        if (result["data"]["success"]) {
            // set session token and go to homepage
            await localStorage.setItem("recipeAppSession", result["data"]["session_token"]);
            await localStorage.setItem("recipeAppUsername", username);
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

            <button onClick={(e) => registerUser()}>Register</button>

        </div>
    )
}

export default Register;