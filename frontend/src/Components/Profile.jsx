import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Profile() {
    const { username } = useParams(); // username of profile owner
    const [bio, setBio] = useState("");
    const [editingBio, setEditingBio] = useState("hidden");
    const [recipes, setRecipes] = useState([]);
    let navigate = useNavigate();

    useEffect(() => {
        checkLoggedIn();
        getBio();
        getUserRecipes();
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

    async function getBio() {
        let result = await axios.post("http://localhost:5000/get_bio", {
            username: username,
        });

        if (result["data"]["success"]) setBio(result["data"]["bio"]);
    }

    async function getUserRecipes() {
        // getOnlyPublic is true when a user who doesnt own the profile views the page
        // getOnlyPublic is false when the profile owner views the page
        let getOnlyPublic = !(await(ownsProfile()));
        
        let result = await axios.post("http://localhost:5000/get_user_recipes", {
            username: username,
            get_only_public: getOnlyPublic
        });

        console.log(result);
        if (result["data"]["success"])
            setRecipes(result["data"]["recipes"])
    }

    async function ownsProfile() {
        return sessionStorage.getItem("recipeAppUsername") === username;
    }

    function logout() {
        sessionStorage.removeItem("recipeAppSession")
        return navigate('/login');
    }

    function editBioButton() {
        let ownsPage = ownsProfile();
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
            <div>
                {recipes.map((recipe) => (
                    // recipe[0] is the recipeId, recipe[2] is the title
                    <div>
                        <a href={`/recipes/${recipe[0]}`}>{recipe[2]}</a>
                    </div>
                ))}
            </div>
            <button onClick={() => logout()}>Log Out</button>
        </div>
    )
}

export default Profile;