import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Profile() {
    const { username } = useParams(); // username of profile owner
    const [bio, setBio] = useState("");
    const [editingBio, setEditingBio] = useState("hidden");
    let navigate = useNavigate();

    useEffect(() => {
        checkLoggedIn();
        getBio(username);
    }, [])

    async function checkLoggedIn() {
        let sessionToken = sessionStorage.getItem("recipeAppSession");
        let user = sessionStorage.getItem("recipeAppUsername")
        if (sessionToken === null) return navigate(`/login`);

        let result = await axios.post("http://localhost:5000/logged_in", {
            username: user,
            session_token: sessionToken,
        });

        // bounce user back to login if not logged in
        if (!result["data"]["success"]) return navigate(`/login`);
    }

    async function getBio(username) {
        console.log(username);
        let result = await axios.post("http://localhost:5000/get_bio", {
            username: username,
        });

        if (result["data"]["success"]) setBio(result["data"]["bio"]);
        console.log(result)
    }

    function logout() {
        sessionStorage.removeItem("recipeAppSession")
        return navigate('/login');
    }

    function editBioButton() {
        let ownsPage = sessionStorage.getItem("recipeAppUsername") === username;
        if (!ownsPage) return;
        return <button onClick={() => setEditingBio("visible")}>Edit Bio</button>
    }

    async function submitBio() {
        let editor = sessionStorage.getItem("recipeAppUsername");
        let sessionToken = sessionStorage.getItem("recipeAppSession");
        setEditingBio("hidden");

        await axios.post("http://localhost:5000/set_bio", {
            profile_owner: username,
            editor: editor,
            bio: bio,
            session_token: sessionToken
        });
    }

    return(
        <div>
            <h1>{username}</h1>
            <div>
                <h3>Biography</h3>
                <p>{bio}</p>
                {editBioButton()}
                <div className={editingBio}>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)}></textarea>
                    <button onClick={() => submitBio()}>Save Edit</button>
                </div>
            </div>

            <h1>Recipes</h1>
            <button onClick={() => logout()}>Log Out</button>
        </div>
    )
}

export default Profile;