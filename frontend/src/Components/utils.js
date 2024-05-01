export async function checkLoggedIn() {
    let sessionToken = sessionStorage.getItem("recipeAppSession");
    let user = sessionStorage.getItem("recipeAppUsername")
    if (sessionToken === null) return false;

    let result = await axios.post("http://localhost:5000/logged_in", {
        username: user,
        session_token: sessionToken,
    });

    // bounce user back to login if not logged in
    return (result["data"]["success"])
}
