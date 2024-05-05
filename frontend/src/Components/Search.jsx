import { useState } from "react";
import axios from "axios"
function Search() {
    const [results, setResults] = useState([]);
    const [query, setQuery] = useState("");

    async function submitSearch() {
        let result = await axios.post("http://localhost:5000/search_recipe", {
            recipe_title: query
        })

        console.log(result);
        if (result["data"]["success"])
            setResults(result["data"]["recipes"])
    }

    return (
        <div>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={() => submitSearch()}>Search for recipe</button>

            {results.map((recipe) => (
                // recipe[0] is the recipeId, recipe[2] is the title
                <div>
                    <a href={`/recipes/${recipe[0]}`}>{recipe[2]}</a>
                </div>
            ))}
        </div>
    )
}

export default Search