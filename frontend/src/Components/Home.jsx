import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';

function Home() {
    const { username } = useParams();
    let navigate = useNavigate();
    useEffect(() => {
        checkLoggedIn();
    }, [])

    async function checkLoggedIn() {
        let sessionToken = sessionStorage.getItem("recipeAppSession");
        console.log(sessionToken);
        if (sessionToken === null) return navigate(`/login`);

        let result = await axios.post("http://localhost:5000/logged_in", {
            username: username,
            session_token: sessionToken,
        });

        // bounce user back to login if not logged in
        if (!result["data"]["success"]) return navigate(`/login`);
    }

    return(
        <div>
            <p>Welcome {username}</p>
        </div>
    )
}

export default Home;