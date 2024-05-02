import {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function NewRecipe() {
    const [title, setTitle] = useState("");
    const [cuisine, setCuisine] = useState("");
    const [isPublic, setIsPublic] = useState(true);

    const [ingredient, setIngredient] = useState("");
    const [ingredients, setIngredients] = useState([]);

    const [allergen, setAllergen] = useState("");
    const [allergens, setAllergens] = useState([]);

    const [steps, setSteps] = useState([]);
    const [currStep, setCurrStep] = useState("");

    const [ingredientEditorVisible, setIngredientEditorVisible] = useState("hidden");
    const [stepEditorVisible, setStepEditorVisible] = useState("hidden");
    const [allergenEditorVisible, setAllergenEditorVisible] = useState("hidden");

    const [currStepImageLinks, setCurrStepImageLinks] = useState([]);
    const [stepImageLinks, setStepImageLinks] = useState([]);

    const navigate = useNavigate();
    useEffect(() => {
        checkLoggedIn();
    }, [])

    async function checkLoggedIn() {
        let sessionToken = sessionStorage.getItem("recipeAppSession");
        let user = sessionStorage.getItem("recipeAppUsername")
        if (sessionToken === null) return navigate(`/login`);

        let result = await axios.post("http://localhost:5000/logged_in", {
            username: user,
            session_token: sessionToken,
        });

        // bounce user back to login if not logged in
        if (!result["data"]["success"]) return navigate(`/login`);
    }
    function addIngredient() {
        const updatedIngredients = [...ingredients, ingredient];
        setIngredients(updatedIngredients);
    }

    function addAllergen() {
        const updatedAllergens = [...allergens, allergen];
        setAllergens(updatedAllergens);
    }

    function saveStep() {
        const updatedSteps = [...steps, currStep];
        const updatedImageLinks = [...stepImageLinks, currStepImageLinks];
        setSteps(updatedSteps);
        setStepImageLinks(updatedImageLinks);

        // reset step
        setCurrStep("");
        setCurrStepImageLinks([]);
        setStepEditorVisible("hidden");
    }

    function promptImageLink() {
        let link = prompt("Image link:");
        const newCurrStepImageLinks = [...currStepImageLinks, link];
        setCurrStepImageLinks(newCurrStepImageLinks);
    }

    function toggleIngredientEditor() {
        if (ingredientEditorVisible === "hidden") setIngredientEditorVisible("visible");
        else setIngredientEditorVisible("hidden");
    }

    function toggleAllergenEditor() {
        if (allergenEditorVisible === "hidden") setAllergenEditorVisible("visible");
        else setAllergenEditorVisible("hidden");
    }

    function toggleStepEditor() {
        if (stepEditorVisible === "hidden") setStepEditorVisible("visible");
        else setStepEditorVisible("hidden");
    }

    const handleIsPublicChange = (event) => {
        setIsPublic(event.target.checked); // Update the checked state
      };

    async function submitRecipe() {
        let result = await axios.post("http://localhost:5000/create_recipe", {
            username: sessionStorage.getItem("recipeAppUsername"),
            title: title,
            cuisine: cuisine,
            is_public: isPublic
        });
        
        let recipeId = result["data"]["recipe_id"]
        console.log(result);

        // create ingredient entries
        for (let ing of ingredients) {
            result = await axios.post("http://localhost:5000/create_ingredient", {
                recipe_id: recipeId,
                name: ing,
            });
        }
        console.log(result);

        // create step entries
        for (let i = 0; i < steps.length; i++) {
            result = await axios.post("http://localhost:5000/create_step", {
                recipe_id: recipeId,
                html: getHtml(i),
            });
        }
        console.log(result);

        // create allergen entries
        for (let i = 0; i < allergens.length; i++) {
            result = await axios.post("http://localhost:5000/create_allergen", {
                recipe_id: recipeId,
                name: allergens[i],
            });
        }
        
        return navigate(`/profile/${sessionStorage.getItem("recipeAppUsername")}`);
    }

    function getHtml(index) {
        let paragraph = `<p>${steps[index]}</p>`
        for (let img of stepImageLinks[index]) 
            paragraph += `<img src=${img} />`

        return paragraph
    }

    return(
        <div>
            <label htmlFor="title">Recipe Title:</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
           
            <label htmlFor="cuisine">Cuisine:</label>
            <input type="text" id="cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)} />

            <div className={ingredientEditorVisible}>
                <h1>Ingredients</h1>
                <input type="text" value={ingredient} onChange={(e) => setIngredient(e.target.value)} />
                <button onClick={() => addIngredient()}>Save Ingredient</button>
            </div>

            <div className={allergenEditorVisible}>
                <h1>Allergens (If Applicable)</h1>
                <input type="text" value={allergen} onChange={(e) => setAllergen(e.target.value)} />
                <button onClick={() => addAllergen()}>Save Allergen</button>
            </div>
            
            <div className={stepEditorVisible}>

                <h1>Step</h1>
                <textarea value={currStep} onChange={(e) => setCurrStep(e.target.value)} />
                <button onClick={() => saveStep()}>Save Step</button>
                <button onClick={() => promptImageLink()}>Link Image</button>
                <p>Images linked in this step:</p>
                <ul>
                    {currStepImageLinks.map((imageLink) => (
                        <li>{imageLink}</li>
                    ))}
                </ul>

            </div>

            <button onClick={() => toggleIngredientEditor()}>Toggle Ingredient Editor</button>
            <button onClick={() => toggleAllergenEditor()}>Toggle Allergen Editor</button>
            <button onClick={() => toggleStepEditor()}>Toggle Step Editor</button>
            
            <div> 
                <h1>Recipe Preview</h1>
                <h1>{cuisine} {title}</h1>

                <h1>Ingredients</h1>
                <ul>
                    {ingredients.map((ingredient) => (
                        <li>{ingredient}</li> 
                    ))}
                </ul>

                <h1>Allergens</h1>
                <ul>
                    {allergens.map((allergen) => (
                        <li>{allergen}</li> 
                    ))}
                </ul>

                <h1>Steps</h1>
                <ol>
                    {steps.map((step, stepIndex) => (
                        <li>
                            <div key={stepIndex}> {/* Wrap the content in a parent element */}
                                <p>{step}</p>
                                {/* Iterate through the images of this step and render them */}
                                {stepImageLinks[stepIndex].map((imageLink, imageIndex) => (
                                    <img className="stepImage" key={imageIndex} src={imageLink} alt={`Step ${stepIndex + 1} Image ${imageIndex + 1}`} />
                                ))}
                            </div>
                        </li>
                    ))}
                </ol>
            </div>

            <button onClick={() => submitRecipe()}>Submit Recipe</button>

            <label>
                <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={handleIsPublicChange}
                />
                Make Public 
            </label>
        </div>
    )
}

export default NewRecipe;