import {useState, useEffect} from "react"
import {useParams, useNavigate} from "react-router-dom"
import axios from "axios"
import '../css/AddCollaborator.css'

function AddCollaborator() {
    const [collaborator, setCollaborator] = useState("");
    const [message, setMessage] = useState("");
    let id = useParams()["id"];
    const navigate = useNavigate();

    useEffect(() => {
        checkOwnsRecipe();
    }, [])

    
    async function checkOwnsRecipe() {
        let ownsRecipe = await axios.post("http://localhost:5000/owns_recipe", {
            username: localStorage.getItem("recipeAppUsername"),
            recipe_id: id
        })
        
        if (!ownsRecipe["data"]["success"]) return navigate(`/login`);
    }

    async function createCollab() {
        let result = await axios.post("http://localhost:5000/create_collab", {
            collaborator: collaborator,
            recipe_id: id
        })

        console.log(result["data"]["message"]);
        setMessage(result["data"]["message"]);
    }

    return(
        <div className="collaborator-container">
            <div className="collaborator-container-box">
                <p>{message}</p>
                <input type="text" 
                className="search-box"
                placeholder="Username of Collaborator to Search"
                value={collaborator} 
                onChange={(e) => setCollaborator(e.target.value)} />

                <div className="search-button-container">
                    <button className="search-button" onClick={() => createCollab()}>Create Collab</button>
                </div>
               
            </div>
            
        </div>

    )
}

export default AddCollaborator;