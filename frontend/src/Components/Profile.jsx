import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Profile() {
    const { username } = useParams();
    const [bio, setBio] = useState("");
    const [editingBio, setEditingBio] = useState("hidden");
    const [recipes, setRecipes] = useState([]);
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [activeTab, setActiveTab] = useState("yourRecipes");
    let navigate = useNavigate();

    useEffect(() => {
        checkLoggedIn();
        getBio();
        getUserRecipes();
        getSavedRecipes();
    }, [])

    async function checkLoggedIn() {
        let sessionToken = sessionStorage.getItem("recipeAppSession");
        let user = sessionStorage.getItem("recipeAppUsername")
        if (sessionToken === null) return navigate(`/login`);

        let result = await axios.post("http://localhost:5000/logged_in", {
            username: user,
            session_token: sessionToken,
        });

        if (!result["data"]["success"]) return navigate(`/login`);
    }

    async function getBio() {
        let result = await axios.post("http://localhost:5000/get_bio", {
            username: username,
        });

        console.log(result["data"])
        if (result["data"]["success"]) setBio(result["data"]["bio"]);
        else return navigate("/notFound");
    }

    async function getUserRecipes() {
        let getOnlyPublic = !(await ownsProfile());
        
        let result = await axios.post("http://localhost:5000/get_user_recipes", {
            username: username,
            get_only_public: getOnlyPublic
        });

        if (result["data"]["success"])
            setRecipes(result["data"]["recipes"]);
    }

    async function getSavedRecipes() {
        let result = await axios.post("http://localhost:5000/get_saved_recipes", {
            username: username,
        });

        if (result["data"]["success"]) {
            setSavedRecipes(result["data"]["recipes"]);
        }
    }

    async function ownsProfile() {
        return sessionStorage.getItem("recipeAppUsername") === username;
    }

    function logout() {
        sessionStorage.removeItem("recipeAppSession");
        navigate('/login');
    }

    function editBioButton() {
        if (!ownsProfile()) return;
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

    return (
        <div>
            <h1>{username}</h1>
            <div>
                <h3>Biography</h3>
                <p>{bio}</p>
                {editBioButton()}
                <div className={editingBio}>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)}></textarea>
                    <button onClick={submitBio}>Save Edit</button>
                </div>
            </div>

            <div className="tabs">
                <button onClick={() => setActiveTab("yourRecipes")}>Your Recipes</button>
                <button onClick={() => setActiveTab("savedRecipes")}>Saved Recipes</button>
            </div>
            
            {activeTab === "yourRecipes" && (
                <div>
                    <h1>Your Recipes</h1>
                    {recipes.map(recipe => (
                        <div key={recipe[0]}>
                            <a href={`/recipes/${recipe[0]}`}>{recipe[2]}</a>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "savedRecipes" && (
                <div>
                    <h1>Saved Recipes</h1>
                    {savedRecipes.map(recipe => (
                        <div key={recipe[0]}>
                            <a href={`/recipes/${recipe[0]}`}>{recipe[2]}</a>
                        </div>
                    ))}
                </div>
            )}

            <button onClick={logout}>Log Out</button>
        </div>
    );
}

export default Profile;
