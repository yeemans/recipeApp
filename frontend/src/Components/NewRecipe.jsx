import {useState, useEffect} from "react";

function NewRecipe() {
    const [title, setTitle] = useState("");
    const [steps, setSteps] = useState([]);
    const [currStep, setCurrStep] = useState("");

    const [stepEditorVisible, setStepEditorVisible] = useState("hidden");

    const [currStepImageLinks, setCurrStepImageLinks] = useState([]);
    const [stepImageLinks, setStepImageLinks] = useState([]);

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

    return(
        <div>
            <label htmlFor="title">Title:</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            
            <div className={stepEditorVisible}>
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

            <button onClick={() => setStepEditorVisible("visible")}>Add Step</button>

            {steps.map((step, stepIndex) => (
                <div key={stepIndex}> {/* Wrap the content in a parent element */}
                    <p>{step}</p> {/* Render the step paragraph */}
                    
                    {/* Iterate through the images of this step and render them */}
                    {stepImageLinks[stepIndex].map((imageLink, imageIndex) => (
                        <img class="stepImage" key={imageIndex} src={imageLink} alt={`Step ${stepIndex + 1} Image ${imageIndex + 1}`} />
                    ))}
                </div>
            ))}


        </div>
    )
}

export default NewRecipe;