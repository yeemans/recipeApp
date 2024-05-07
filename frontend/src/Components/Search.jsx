import { useState } from "react";
import axios from "axios"
import '../css/Search.css'

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
        <div className="search-container">
            <div className="search-container-box">
                <input className="search-box" placeholder="Seach a Recipe" type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
                <p> </p>
                <div className="search-button-container">
                    <button className="search-button" onClick={() => submitSearch()}>Search</button>
                </div>
               

                {results.map((recipe) => (
                    // recipe[0] is the recipeId, recipe[2] is the title
                    <div className="search-result-container">
                        <a href={`/recipes/${recipe[0]}`}>{recipe[2]}</a>
                    </div>
                ))}
            </div>
            
        </div>
    )
}

export default Search