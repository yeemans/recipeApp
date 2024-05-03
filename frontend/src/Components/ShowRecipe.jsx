import {useEffect, useState } from "react";
import { useParams, useNavigate} from "react-router-dom";
import AddReview from "./AddReview.jsx";
import axios from "axios";
import Review from "./Review.jsx";
import RatingSlider from "./RatingSlider.jsx";

function ShowRecipe() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [recipe, setRecipe] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [allergens, setAllergens] = useState([]);
    const [steps, setSteps] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(3); // Initial rating value
    const [averageRating, setAverageRating] = useState("No ratings yet.")

    useEffect(() => {
        getRecipe();
        getIngredients();
        getAllergens();
        getSteps();
        getReviews();
        redirectIfPrivate();
        getAverageRating();
    }, [])

    async function getRecipe() {
        // recipes are an array: [is, chef_id, title, cusine, is_public]
        let recipe = await axios.post("http://localhost:5000/get_recipe_by_id", {
            id: id,
        });
        if (recipe["data"]["success"]) {
            setRecipe(recipe["data"]["recipe"])
            return recipe["data"]["recipe"][4] // return whether or not this is private
        }
    }

    async function getIngredients() {
        // ingredients are an array: [id, recipe_id, name]
        let ingredients = await axios.post("http://localhost:5000/get_recipe_ingredients", {
            recipe_id: id,
        });
        if (ingredients["data"]["success"]) setIngredients(ingredients["data"]["ingredients"])
    }

    async function getAllergens() {
        // allergens are an array: [id, recipe_id, name]
        let allergens = await axios.post("http://localhost:5000/get_recipe_allergens", {
            recipe_id: id,
        });
        if (allergens["data"]["success"]) setAllergens(allergens["data"]["allergens"])
    }

    async function getSteps() {
        // allergens are an array: [id, recipe_id, html]
        let steps = await axios.post("http://localhost:5000/get_recipe_steps", {
            recipe_id: id,
        });
        if (steps["data"]["success"]) setSteps(steps["data"]["steps"])
    }

    async function getReviews() {
        // reviews are an array: [id, recipe_id, user_id, body]
        let reviews = await axios.post("http://localhost:5000/get_recipe_reviews", {
            recipe_id: id,
        });
        if (reviews["data"]["success"]) setReviews(reviews["data"]["reviews"]);
    }

    async function redirectIfPrivate() {
        let isPrivate = !(await getRecipe());
        let ownsRecipe = await axios.post("http://localhost:5000/owns_recipe", {
            username: sessionStorage.getItem("recipeAppUsername"),
            recipe_id: id
        })

        console.log(isPrivate)
        console.log(ownsRecipe["data"]["success"])
        if (isPrivate && !ownsRecipe["data"]["success"])
            return navigate("/recipeIsPrivate")
    }

    async function getAverageRating() {
        let result = await axios.post("http://localhost:5000/average_rating", {
            recipe_id: id
        })
        console.log(result);
        if (result["data"]["success"] && result["data"]["averageRating"] !== null)
            setAverageRating(Math.round(result["data"]["averageRating"] * 100) / 100) 
    }

    return(
        <div>
            <div> 
                <h1>{recipe[2]}</h1>
                <h3>{`Cuisine: ${recipe[3]}`}</h3>
                <h3>Rating: {averageRating} </h3>
            </div>
            <RatingSlider username={sessionStorage.getItem("recipeAppUsername")}
            recipeId={id} 
            rating={rating} 
            setRating={setRating} />

            <h2>Ingredients</h2>
            <ul>
                {ingredients.map((ingredient) => (
                    // ingredient[2] is the ingredient name
                    <li>{ingredient[2]}</li>
                ))}
            </ul>

            <h2>Allergens</h2>
            <ul>
                {allergens.map((allergen) => (
                    // allergen[2] is the allergen name
                    <li>{allergen[2]}</li>
                ))}
            </ul>

            <h2>Steps</h2>
            <ol className="stepList">
                {steps.map((step) => (
                    // step[2] is the html
                    <li dangerouslySetInnerHTML={{ __html: step[2] }} />
                ))}
            </ol>

            <h2>Reviews</h2>
            <div>
                {reviews.map((review) => (
                    // reviews are an array [review id, user_id, username, body]
                    <Review review={review} />
                ))}
            </div>

            <AddReview id={id} title={recipe[2]} />
        </div>
    )

}

export default ShowRecipe;