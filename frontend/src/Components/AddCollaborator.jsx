import {useState, useEffect} from "react"
import {useParams, useNavigate} from "react-router-dom"
import axios from "axios"

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
        <div>
            <p>{message}</p>
            <p>Username of collaborator to add:</p>
            <input type="text" 
            value={collaborator} 
            onChange={(e) => setCollaborator(e.target.value)} />

            <button onClick={() => createCollab()}>Create Collab</button>
        </div>
    )
}

export default AddCollaborator;