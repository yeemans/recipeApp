import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/Profile.css'

function Profile() {
    const { username } = useParams(); // username of profile owner
    const [bio, setBio] = useState("");
    const [editingBio, setEditingBio] = useState("hidden");
    const [recipes, setRecipes] = useState([]);
    const [collabRecipes, setCollabRecipes] = useState([]);
    const [savedRecipes, setSavedRecipes] = useState([]);
    let navigate = useNavigate();

    useEffect(() => {
        getBio();
        getUserRecipes();
        getCollabRecipes();
        getSavedRecipes();
    }, [])

    async function getBio() {
        let result = await axios.post("http://localhost:5000/get_bio", {
            username: username,
        });

        console.log(result["data"])
        if (result["data"]["success"]) setBio(result["data"]["bio"]);
        else return navigate("/notFound");
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

    function ownsProfile() {
        return localStorage.getItem("recipeAppUsername") === username;
    }

    function logout() {
        localStorage.removeItem("recipeAppSession");
        localStorage.removeItem("recipeAppUsername")
        return navigate('/login');
    }

    function editBioButton() {
        let ownsPage = ownsProfile();
        console.log("owns page:" + ownsPage)
        if (!ownsPage) return;
        return <button onClick={() => setEditingBio("visible")}>Edit Bio</button>
    }

    async function submitBio() {
        let editor = localStorage.getItem("recipeAppUsername");
        let sessionToken = localStorage.getItem("recipeAppSession");
        setEditingBio("hidden");

        await axios.post("http://localhost:5000/set_bio", {
            profile_owner: username,
            editor: editor,
            bio: bio,
            session_token: sessionToken
        });
    }

    async function getCollabRecipes() {
        let result = await axios.post("http://localhost:5000/get_collab_recipes", {
            username: username
        })

        if (result["data"]["success"])
            setCollabRecipes(result["data"]["recipes"])
    }

    async function getSavedRecipes() {
        let result = await axios.post("http://localhost:5000/get_saved_recipes", {
            username: username
        })

        if (result["data"]["success"])
            setSavedRecipes(result["data"]["recipes"])
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
                    <>
                        <a href={`/recipes/${recipe[0]}`}>{recipe[2]}</a><p>  </p>
                        </>
                ))}
            </div>

            <h1>Collaborating On Recipes</h1>
            <div>
                {collabRecipes.map((recipe) => (
                    // recipe[0] is the recipeId, recipe[2] is the title
                    <>
                    <a href={`/recipes/${recipe[0]}`}>{recipe[2]}</a><p>  </p>
                    </>
                ))}
            </div>
            

            <h1>Saved Recipes</h1>
            <div>
                {savedRecipes.map((recipe) => (
                    // recipe[0] is the recipeId, recipe[2] is the title
                    <>
                    <a href={`/recipes/${recipe[0]}`}>{recipe[2]}</a><p>  </p>
                    </>
                
                ))}
            </div>
    <br></br>
            <div>
                <button onClick={() => logout()}>Log Out</button>
            </div>
        </div>
    )
}

export default Profile;