import {useState, useEffect} from "react";
import { useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import '../css/EditRecipe.css'

function EditRecipe() {
    let id = useParams()["id"];
    const [title, setTitle] = useState("");
    const [cuisine, setCuisine] = useState("");

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
        checkOwnsRecipe();
        getRecipe();
        getIngredients();
        getAllergens();
        getSteps();
    }, [])

    async function getRecipe() {
        // recipes are an array: [id, chef_id, title, cusine, is_public]
        let recipe = await axios.post("http://localhost:5000/get_recipe_by_id", {
            id: id,
        });
        if (recipe["data"]["success"]) {
            setTitle(recipe["data"]["recipe"][2])
            setCuisine(recipe["data"]["recipe"][3])
        }
    }

    async function getIngredients() {
        // ingredients are an array: [id, name, recipeId]
        let ingredients = await axios.post("http://localhost:5000/get_recipe_ingredients", {
            recipe_id: id,
        });

        
        console.log(ingredients["data"]["ingredients"])
        if (ingredients["data"]["success"]) {
            setIngredients(getSecondElement(ingredients["data"]["ingredients"]))
        }
    }

    async function getAllergens() {
        // allergens are an array: [id, name, recipe_id]
        let allergens = await axios.post("http://localhost:5000/get_recipe_allergens", {
            recipe_id: id,
        });
        if (allergens["data"]["success"]) {
            setAllergens(getSecondElement(allergens["data"]["allergens"]))
        }
    }

    async function getSteps() {
        // allergens are an array: [id, recipe_id, html]
        let steps = await axios.post("http://localhost:5000/get_recipe_steps", {
            recipe_id: id,
        });
        if (steps["data"]["success"]) {
            let stepHTMLArray = getSecondElement(steps["data"]["steps"]);
            setSteps(removeStepsHTML(stepHTMLArray));
            getStepImageLinks(getSecondElement(steps["data"]["steps"]))
        }
    }

    function removeStepsHTML(stepHTMLArray) {
        let updatedSteps = [];
        const parser = new DOMParser();

        function removeImageTags(parser, htmlString) {
            let doc = parser.parseFromString(htmlString, 'text/html')
            let imgElements = doc.getElementsByTagName('img');
        
            let imgArray = Array.from(imgElements);
            imgArray.forEach(img => img.parentNode.removeChild(img));
        
            // Serialize the updated DOM back to HTML string
            let serializer = new XMLSerializer();
            let updatedHtmlString = serializer.serializeToString(doc);
            return updatedHtmlString;
        }

        function extractParagraphTagText(parser, htmlString) {
            const doc = parser.parseFromString(htmlString, 'text/html');
            const paragraphElements = doc.getElementsByTagName('p');
            const paragraphArray = Array.from(paragraphElements);
            const paragraphTexts = paragraphArray.map(p => p.textContent.trim());

            return paragraphTexts;
        }

        for (let htmlString of stepHTMLArray) {
            htmlString = removeImageTags(parser, htmlString)
            htmlString = extractParagraphTagText(parser, htmlString);
            updatedSteps.push(htmlString);   
        }
        return updatedSteps;
    }

    async function getStepImageLinks(steps) {
        // gather image links from html string in steps array
        const parser = new DOMParser();
        let updatedStepImageLinks = [];

        for (let step of steps) {
            let doc = parser.parseFromString(step, 'text/html');

            let imgElements = doc.getElementsByTagName('img');
            let imgArray = Array.from(imgElements);
            let imgSrcs = imgArray.map(img => img.getAttribute('src'));

            updatedStepImageLinks.push(imgSrcs);
        }
    
        setStepImageLinks(updatedStepImageLinks);
    }

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

    async function checkOwnsRecipe() {
        let ownsRecipe = await axios.post("http://localhost:5000/owns_recipe", {
            username: localStorage.getItem("recipeAppUsername"),
            recipe_id: id
        })
        
        if (!ownsRecipe["data"]["success"]) return navigate(`/login`);
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
        
        return <button onClick={() => addIngredient()}>Save Ingredient</button>
    }

    function getAllergenButton() {
        if (modifyingItem)
            return <button onClick={() => modifyAllergen()}>Modify Allergen</button>

        return <button onClick={() => addAllergen()}>Save Allergen</button>
    }

    function getStepButton() {
        if (modifyingItem)
            return <button onClick={() => modifyStep()}>Modify Step</button>

        return <button onClick={() => saveStep()}>Save Step</button>
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

    async function submitRecipe() {  
        // delete then recreate all ingredients, allergens, and steps
        let recipeId = id;
        await deleteIngredientsStepsAllergens(recipeId);
        await rewriteTitleAndCuisine(recipeId);

        // create ingredient entries
        for (let ing of ingredients) {
            await axios.post("http://localhost:5000/create_ingredient", {
                recipe_id: recipeId,
                name: ing,
            });
        }

        // create step entries
        for (let i = 0; i < steps.length; i++) {
            await axios.post("http://localhost:5000/create_step", {
                recipe_id: recipeId,
                html: getHtml(i),
            });
        }

        // create allergen entries
        for (let i = 0; i < allergens.length; i++) {
            await axios.post("http://localhost:5000/create_allergen", {
                recipe_id: recipeId,
                name: allergens[i],
            });
        }
        
        return navigate(`/profile/${localStorage.getItem("recipeAppUsername")}`);
    }

    async function deleteIngredientsStepsAllergens(recipeId) {
        await axios.post("http://localhost:5000/delete_ingredients_steps_allergens", {
            recipe_id: recipeId
        })  
    }

    async function rewriteTitleAndCuisine(recipeId) {
        await axios.post("http://localhost:5000/rewrite_title_and_cuisine", {
            recipe_id: recipeId,
            title: title,
            cuisine: cuisine
        }) 
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

    function getSecondElement(twoDArray) {
        let result = []
        for (let array of twoDArray)
            result.push(array[1])
        return result;
    }

    return(
        <div className="edit-recipe-container">
            <div className="recipe-title-container">
                <div>
                    <label className="recipe-title" htmlFor="title">Recipe Title:</label>
                    
                </div>
                <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <div>
                    <label className="recipe-title" htmlFor="cuisine">Cuisine:</label>
                    
                </div>
                <input type="text" id="cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)} />
                <div>
                    <button id="edit-recipe-submit" className="edit-recipe-button" onClick={() => submitRecipe()}>Submit Recipe</button>
                </div>
               
            </div>
           
            <div>

            
            <div className="right-container"> 
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
                <div className={ingredientEditorVisible}>
                <input type="text" value={ingredient} onChange={(e) => setIngredient(e.target.value)} />
                {getIngredientButton()}
            </div>
                <button className="edit-recipe-button" onClick={() => toggleIngredientEditor()}>Toggle Ingredient Editor</button>
                
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

                <div className={allergenEditorVisible}>
                <input type="text" value={allergen} onChange={(e) => setAllergen(e.target.value)} />
                {getAllergenButton()}
            </div>
            <button className="edit-recipe-button" onClick={() => toggleAllergenEditor()}>Toggle Allergen Editor</button>
            

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


            <div className={stepEditorVisible}>
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


         
            <button className="edit-recipe-button" onClick={() => toggleStepEditor()}>Toggle Step Editor</button>
          
            </div>

            
            </div>
        </div>
    )
}

export default EditRecipe;