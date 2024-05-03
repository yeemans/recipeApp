import {useState, useEffect} from "react"
import axios from "axios"

function AddReview(props) {
    // props = {"id": recipeId}
    const id = props.id;
    const [showAddReview, setShowAddReview] = useState("hidden");
    const [reviewBody, setReviewBody] = useState("");
    

    useEffect(() => {
        checkLoggedIn();
    }, [])

    function getReviewInput() {
        return <textarea placeholder="Write your review..." 
                value={reviewBody} 
                onChange={(e) => setReviewBody(e.target.value)} />
    }

    async function checkLoggedIn() {
        let result = await axios.post("http://localhost:5000/logged_in", {
            username: sessionStorage.getItem("recipeAppUsername"),
            session_token: sessionStorage.getItem("recipeAppSession"),
        });
        if (result["data"]["success"]) setShowAddReview("visible");
    }

    async function submitReview() {
        let result = await axios.post("http://localhost:5000/create_review", {
            recipe_id: id,
            review_body: reviewBody,
            username: sessionStorage.getItem("recipeAppUsername")
        })

        // refresh the page
        document.location.reload(true);
    }

    return(
        <div className={showAddReview}>
            {getReviewInput()}
            <button onClick={() => submitReview()}>Submit Review</button>
        </div>
    )
}

export default AddReview;