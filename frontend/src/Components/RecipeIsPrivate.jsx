function RecipeIsPrivate() {
    return <h1>You may not view this recipe.</h1>

    function goBackButton() {
        return navigate(`/profile/${sessionStorage.getItem("recipeAppUsername")}`);
      }
      
      <div className="tabs">
        <button onClick={() => goBackButton()}>Back to Profile</button>
    </div>
      
    }

export default RecipeIsPrivate;