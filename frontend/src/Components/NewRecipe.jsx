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

    const [modifyingItem, setModifyingItem] = useState(false);
    const [modifyingIngredientIndex, setModifyingIngredientIndex] = useState(null);
    const [modifyingAllergenIndex, setModifyingAllergenIndex] = useState(null);
    const [modifyingStepIndex, setModifyingStepIndex] = useState(null);

    const navigate = useNavigate();
    useEffect(() => {
        checkLoggedIn();
    }, [])

    async function checkLoggedIn() {
        let sessionToken = localStorage.getItem("recipeAppSession");
        let user = localStorage.getItem("recipeAppUsername")
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

    function getIngredientButton() {
        if (modifyingItem) 
            return <button onClick={()=> modifyIngredient()}>Modify Ingredient</button>
        
        return <button onClick={() => addIngredient()}>Save</button>
    }

    function getAllergenButton() {
        if (modifyingItem)
            return <button onClick={() => modifyAllergen()}>Modify Allergen</button>

        return <button onClick={() => addAllergen()}>Save</button>
    }

    function getStepButton() {
        if (modifyingItem)
            return <button onClick={() => modifyStep()}>Modify Step</button>

        return <button onClick={() => saveStep()}>Save</button>
    }

    function modifyIngredient() {
        let updatedIngredients = [...ingredients];
        updatedIngredients[modifyingIngredientIndex] = ingredient;
        setIngredients(updatedIngredients);

        // no longer editing, cleanup
        setIngredientEditorVisible("hidden");
        setModifyingIngredientIndex(null);
        setModifyingItem(false);
    }

    function modifyAllergen() {
        let updatedAllergens = [...allergens];
        updatedAllergens[modifyingAllergenIndex] = allergen;
        setAllergens(updatedAllergens);

        // no longer editing, cleanup
        setAllergenEditorVisible("hidden");
        setModifyingAllergenIndex(null);
        setModifyingItem(false);
    }

    function modifyStep() {
        let updatedSteps = [...steps];
        updatedSteps[modifyingStepIndex] = currStep;
        setSteps(updatedSteps);

        let updatedStepImageLinks = [...stepImageLinks];
        updatedStepImageLinks[modifyingStepIndex] = currStepImageLinks;
        setStepImageLinks(updatedStepImageLinks);

        // no longer editing, cleanup
        setStepEditorVisible("hidden");
        setModifyingStepIndex(null);
        setModifyingItem(false);
    }

    const handleIsPublicChange = (event) => {
        setIsPublic(event.target.checked); // Update the checked state
    };

    async function submitRecipe() {
        let result = await axios.post("http://localhost:5000/create_recipe", {
            username: localStorage.getItem("recipeAppUsername"),
            title: title,
            cuisine: cuisine,
            is_public: isPublic
        });
        
        let recipeId = result["data"]["recipe_id"]

        // create ingredient entries
        for (let ing of ingredients) {
            result = await axios.post("http://localhost:5000/create_ingredient", {
                recipe_id: recipeId,
                name: ing,
            });
        }

        // create step entries
        for (let i = 0; i < steps.length; i++) {
            result = await axios.post("http://localhost:5000/create_step", {
                recipe_id: recipeId,
                html: getHtml(i),
            });
        }

        // create allergen entries
        for (let i = 0; i < allergens.length; i++) {
            result = await axios.post("http://localhost:5000/create_allergen", {
                recipe_id: recipeId,
                name: allergens[i],
            });
        }
        
        return navigate(`/profile/${localStorage.getItem("recipeAppUsername")}`);
    }

    function getHtml(index) {
        let paragraph = `<p>${steps[index]}</p>`
        for (let img of stepImageLinks[index]) 
            paragraph += `<img src=${img} />`

        return paragraph
    }

    function enableModifyIngredient(ingredientName, index) {
        setModifyingItem(true);
        setIngredient(ingredientName);
        setIngredientEditorVisible("visible");
        setModifyingIngredientIndex(index);
    }

    function enableModifyAllergen(allergenName, index) {
        setModifyingItem(true);
        setAllergen(allergenName);
        setAllergenEditorVisible("visible");
        setModifyingAllergenIndex(index);
    }

    function enableModifyStep(step, index) {
        setModifyingItem(true);
        setCurrStep(step);
        setStepEditorVisible("visible");
        setModifyingStepIndex(index);
        setCurrStepImageLinks(stepImageLinks[index]);
    }
     
    // testing comment
    function deleteImageLink(index) {
        const updatedLinks = currStepImageLinks.filter((item, idx) => idx !== index);
        setCurrStepImageLinks(updatedLinks);
    }

    return(
        <div>
            <label htmlFor="title">Title: </label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <p></p>
            <label htmlFor="cuisine">Cuisine: </label>
            <input type="text" id="cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)} />
            <p></p>
            <div className={ingredientEditorVisible}>
                <h1>Ingredients</h1>
                <input type="text" value={ingredient} onChange={(e) => setIngredient(e.target.value)} />
                {getIngredientButton()}
            </div>

            <div className={allergenEditorVisible}>
                <h1>Allergens (If Applicable)</h1>
                <input type="text" value={allergen} onChange={(e) => setAllergen(e.target.value)} />
                {getAllergenButton()}
            </div>
            
            <div className={stepEditorVisible}>
                <h1>Step</h1>
                <textarea value={currStep} onChange={(e) => setCurrStep(e.target.value)} />
                {getStepButton()}

                <button onClick={() => promptImageLink()}>Link Image</button>
                <p>Images linked in this step:</p>
                <ul>
                    {currStepImageLinks.map((imageLink, index) => (
                        <div>
                            <li>{imageLink}</li>
                            <button onClick={() => deleteImageLink(index)}>Delete Image</button>
                        </div>
                    ))}
                </ul>
            </div>
            
            <div> 
                <h1>Recipe Preview</h1>
                <h1>{cuisine} {title}</h1>

                <h1>Ingredients</h1>
                <ul>
                    {ingredients.map((ingredientName, index) => (
                        <div>
                            <li>{ingredientName}</li> 
                            <button onClick={() => enableModifyIngredient(ingredientName, index)}>
                                Edit Ingredient
                            </button>
                        </div>
                    ))}
                </ul>

                <button onClick={() => toggleIngredientEditor()}>Toggle Ingredient Editor</button>

                <h1>Allergens</h1>
                <ul>
                    {allergens.map((allergenName, index) => (
                        <div>
                            <li>{allergenName}</li>
                            <button onClick={() => enableModifyAllergen(allergenName, index)}>
                                Edit Allergen
                            </button>
                        </div>
                    ))}
                </ul>

                <button onClick={() => toggleAllergenEditor()}>Toggle Allergen Editor</button>

                <h1>Steps</h1>
                <ol>
                    {steps.map((step, stepIndex) => (
                        <li>
                            <div key={stepIndex}> {/* Wrap the content in a parent element */}
                                <p>{step}</p>
                                <button onClick={() => enableModifyStep(step, stepIndex)}>
                                    Edit Step
                                </button>

                                {/* Iterate through the images of this step and render them */}
                                {stepImageLinks[stepIndex].map((imageLink, imageIndex) => (
                                    <img className="stepImage" key={imageIndex} src={imageLink} alt={`Step ${stepIndex + 1} Image ${imageIndex + 1}`} />
                                ))}
                            </div>
                        </li>
                    ))}
                </ol>

                <button onClick={() => toggleStepEditor()}>Toggle Step Editor</button>
                <p></p>
            </div>
            
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={handleIsPublicChange}
                    />
                    Make Public 
                </label>
            </div>
            
                <br></br>
            <div>
                <button onClick={() => submitRecipe()}>Submit Recipe</button>
            </div>

            
        </div>
    )
}

export default NewRecipe;