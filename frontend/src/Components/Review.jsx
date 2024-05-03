import axios from "axios"
import {useState, useEffect} from "react"

function Review(props) {
    // props.review is an array [review id, user id, username, body]
    const [loggedIn, setLoggedIn] = useState(false);
    const [helpfulCount, setHelpfulCount] = useState(0);
    const [unhelpfulCount, setUnhelpfulCount] = useState(0);

    useEffect(() => {
        checkLoggedIn();
        getHelpfulCounts();
    })

    async function markHelpful(helpful) {
        await axios.post("http://localhost:5000/mark_helpful", {
            review_id: props.review[0],
            username: sessionStorage.getItem("recipeAppUsername"),
            helpful: helpful
        })
        // reload page
        document.location.reload(true);
    }

    async function getHelpfulCounts() {
        let result = await axios.post("http://localhost:5000/get_review_helpful_counts", {
            review_id: props.review[0],
            username: sessionStorage.getItem("recipeAppUsername"),
        })

        console.log(result["data"]["success"])

        if (!result["data"]["success"]) return
        setHelpfulCount(result["data"]["helpful"])
        setUnhelpfulCount(result["data"]["unhelpful"])
    }

    async function checkLoggedIn() {
        let result = await axios.post("http://localhost:5000/logged_in", {
            username: sessionStorage.getItem("recipeAppUsername"),
            session_token: sessionStorage.getItem("recipeAppSession"),
        });
        if (result["data"]["success"]) setLoggedIn(true);
    }

    function getMarkHelpfulButtons() {
        if (!loggedIn) return false;
        return (
            <div>
                <button onClick={() => markHelpful(true)}>Mark Helpful</button>
                <button onClick={() => markHelpful(false)}>Mark Unhelpful</button>
            </div>
        )
    }

    return (
        <div>
            <p>{props.review[2]} says</p>
            <p>{props.review[3]}</p>

            {getMarkHelpfulButtons()}
            <p>Helpful: {helpfulCount}</p>
            <p>Unhelpful: {unhelpfulCount}</p>
        </div>
    )
}

export default Review;