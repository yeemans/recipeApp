import {useEffect, useState } from "react";
import { useParams, useNavigate} from "react-router-dom";
import AddReview from "./AddReview.jsx";
import axios from "axios";
import Review from "./Review.jsx";
import RatingSlider from "./RatingSlider.jsx";
import '../css/ShowRecipe.css'

function ShowRecipe() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [recipe, setRecipe] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [allergens, setAllergens] = useState([]);
    const [steps, setSteps] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(3); // Initial rating value
    const [averageRating, setAverageRating] = useState("No ratings yet.");
    const [loggedIn, setLoggedIn] = useState(false);
    const [isRecipeOwner, setIsRecipeOwner] = useState(false);

    useEffect(() => {
        checkLoggedIn();
        getRecipe();
        getIngredients();
        getAllergens();
        getSteps();
        getReviews();
        redirectIfPrivate();
        getAverageRating();
    }, [])

    async function checkLoggedIn() {
        let result = await axios.post("http://localhost:5000/logged_in", {
            username: localStorage.getItem("recipeAppUsername"),
            session_token: localStorage.getItem("recipeAppSession"),
        });
        if (result["data"]["success"]) setLoggedIn(true);
    }

    async function getRecipe() {
        // recipes are an array: [id, chef_id, title, cuisine, isPublic]
        let recipe = await axios.post("http://localhost:5000/get_recipe_by_id", {
            id: id,
        });

        if (recipe["data"]["success"]) {
            setRecipe(recipe["data"]["recipe"])
            console.log(recipe["data"]["recipe"])
            return recipe["data"]["recipe"][4] // return whether or not this is private
        }
    }

    async function getIngredients() {
        // ingredients are an array: [id, name, recipe_id]
        let ingredients = await axios.post("http://localhost:5000/get_recipe_ingredients", {
            recipe_id: id,
        });

        console.log(ingredients["data"]["ingredients"])
        if (ingredients["data"]["success"]) setIngredients(ingredients["data"]["ingredients"])
    }

    async function getAllergens() {
        // allergens are an array: [id, name, recipe_id]
        let allergens = await axios.post("http://localhost:5000/get_recipe_allergens", {
            recipe_id: id,
        });
        if (allergens["data"]["success"]) setAllergens(allergens["data"]["allergens"])
    }

    async function getSteps() {
        // allergens are an array: [id, html, recipe_id,]
        let steps = await axios.post("http://localhost:5000/get_recipe_steps", {
            recipe_id: id,
        });
        if (steps["data"]["success"]) setSteps(steps["data"]["steps"])
    }

    async function getReviews() {
        // reviews are an array: [id, body, recipe_id, user_id,]
        let reviews = await axios.post("http://localhost:5000/get_recipe_reviews", {
            recipe_id: id,
        });
        if (reviews["data"]["success"]) setReviews(reviews["data"]["reviews"]);
    }

    async function redirectIfPrivate() {
        let isPrivate = !(await getRecipe());
        let ownsRecipe = await axios.post("http://localhost:5000/owns_recipe", {
            username: localStorage.getItem("recipeAppUsername"),
            recipe_id: id
        })

        setIsRecipeOwner(ownsRecipe["data"]["success"])
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

    
    async function remixRecipe() {
        let result = await axios.post("http://localhost:5000/create_recipe", {
            username: localStorage.getItem("recipeAppUsername"),
            title: recipe[2] + " remix",
            cuisine: recipe[3],
            is_public: recipe[4]
        });
        
        let recipeId = result["data"]["recipe_id"]
        // create ingredient entries
        for (let ing of ingredients) {
            // ingredients is an array [id, name, recipe_id]
            let ingName = ing[1]
            result = await axios.post("http://localhost:5000/create_ingredient", {
                recipe_id: recipeId,
                name: ingName
            });
        }

        // create step entries
        for (let i = 0; i < steps.length; i++) {
            // steps is an array [id, html, recipe_id]
            result = await axios.post("http://localhost:5000/create_step", {
                recipe_id: recipeId,
                html: steps[i][1],
            });
        }

        // create allergen entries
        for (let i = 0; i < allergens.length; i++) {
            // allergens is an array [id, name, recipe_id]
            result = await axios.post("http://localhost:5000/create_allergen", {
                recipe_id: recipeId,
                name: allergens[i][1],
            });
        }
        
        return navigate(`/`);
    }

    function getRemixButton() {
        if (loggedIn) return <button onClick={(e) => remixRecipe()}>Remix</button>
        return "";
    }

    function getEditButton() {
        if (isRecipeOwner) return <button onClick={() => {return navigate(`/editRecipe/${id}`)} }>
            Edit
        </button>
        return ""
    }

    function getSaveButton() {
        if (!loggedIn) return ""
        return <button onClick={() => saveRecipe()}>Save Recipe</button>
    }

    function addCollaborator() {
        return navigate(`/addCollaborator/${id}`)
    }

    async function saveRecipe() {
        let username = localStorage.getItem("recipeAppUsername");
        await axios.post("http://localhost:5000/save_recipe", {
            recipe_id: id,
            username: username
        })

        return navigate(`/profile/${username}`)
    }

    return(
        <div className="show-recipe-container">
            <div className="show-recipe-button-container"> 
                <h1>{recipe[2]}</h1>
                <h3>{`Cuisine: ${recipe[3]}`}</h3>
                <h3>Rating: {averageRating} </h3>
                {getRemixButton()}
                {getEditButton()}
                {getSaveButton()}
                <button onClick={() => addCollaborator()}>Add Collaborator</button>
                <RatingSlider username={localStorage.getItem("recipeAppUsername")}
            recipeId={id} 
            rating={rating} 
            setRating={setRating} />
            </div>
            <div className="show-recipe-info-container">
                <h2>Ingredients:</h2>
                <ul>
                    {ingredients.map((ingredient) => (
                        // ingredient[1] is the ingredient name
                        <li>{ingredient[1]}</li>
                    ))}
                </ul>

                <h2>Allergens:</h2>
                <ul>
                    {allergens.map((allergen) => (
                        // allergen[1] is the allergen name
                        <li>{allergen[1]}</li>
                    ))}
                </ul>
                <h2>Steps:</h2>
                <ol className="stepList">
                    {steps.map((step) => (
                        // step[2] is the html
                        <li dangerouslySetInnerHTML={{ __html: step[1] }} />
                    ))}
                </ol>
            </div>
            <div className="show-recipe-review-container">
                <h2>Reviews</h2>
                <div>
                    {reviews.map((review) => (
                        // reviews are an array [review id, user_id, username, body]
                        <Review review={review} />
                    ))}
                </div>

                <AddReview id={id} title={recipe[2]} />
            </div>
        </div>
    )

}

export default ShowRecipe;