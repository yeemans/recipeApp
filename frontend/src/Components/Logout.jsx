import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem("recipeAppSession");
        localStorage.removeItem("recipeAppUsername");
        return navigate('/login');
    }, [])

    return(
        <div><h1>Logging out...</h1></div>
    )
}

export default Logout;