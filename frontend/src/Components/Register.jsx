import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
    let [username, setUsername] = useState("");
    let [password, setPassword] = useState("");
    let [errorMessage, setErrorMessage] = useState("");
    let navigate = useNavigate();
    
    async function registerUser() {
        console.log(password);
        let result = await axios.post("http://localhost:5000/register", {
            username: username,
            password: password,
        });
        
        console.log(result["data"]["success"])
        if (result["data"]["success"]) 
            // redirect to homepage 
            return navigate(`/home/${username}`);
        else
            setErrorMessage(result["data"]["message"])

        console.log(result);
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