import {useParams, useNavigate} from "react-router-dom"
import {useState, useEffect} from "react"
import axios from "axios"

function AddReview(props) {
    // props = {"id": recipeId}
    const id = props.id;
    const [reviewBody, setReviewBody] = useState("");
    const navigate = useNavigate();

    function getReviewInput() {
        return <textarea placeholder="Write your review..."
                value={reviewBody} 
                onChange={(e) => setReviewBody(e.target.value)} />
    }

    async function submitReview() {
        let result = await axios.post("http://localhost:5000/create_review", {
            recipe_id: id,
            review_body: reviewBody,
            username: sessionStorage.getItem("recipeAppUsername")
        })

        // refresh the page
        return navigate("");
    }

    return(
        <div>
            {getReviewInput()}
            <button onClick={() => submitReview()}>Submit Review</button>
        </div>
    )
}

export default AddReview;