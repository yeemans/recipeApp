import axios from "axios"
import {useState, useEffect} from "react"

const RatingSlider = (props) => {
    const [loggedIn, setLoggedIn] = useState(false);
    useEffect(() => {
        checkLoggedIn();
    }, [])

    async function checkLoggedIn() {
        let result = await axios.post("http://localhost:5000/logged_in", {
            username: sessionStorage.getItem("recipeAppUsername"),
            session_token: sessionStorage.getItem("recipeAppSession"),
        });
        if (result["data"]["success"]) setLoggedIn(true);
    }

    async function submitRating() {
        let result = await axios.post("http://localhost:5000/submit_rating", {
            recipe_id: props.recipeId,
            username: props.username,
            rating: props.rating
        })

        // reload page
        document.location.reload(true);
    }

    function getRatingSlider() {
        if (!loggedIn) return;
        return(
            <div>
                <h2>Rating Slider</h2>
                <input
                    type="range"
                    min="1"
                    max="5"
                    value={props.rating}
                    className="slider"
                    onChange={(e) => {props.setRating(parseInt(e.target.value))}}
                />
                <p>Rating: {props.rating}</p>
                <button onClick={() => submitRating()}>Submit Rating</button>
            </div>
        )
    }

    return (
        <div>
            {getRatingSlider()}
        </div>
    );
};

export default RatingSlider;
