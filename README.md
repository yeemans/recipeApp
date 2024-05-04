Running the app
1. Create two terminals
2. cd frontend in the first terminal, then "npm i" then "npm run dev"
3. cd backend in the second terminal
4. run "pip install -r requirements.txt" in the second terminal
5. create a database called "recipeDB" with postgres in the second terminal:
    - sudo -u postgres psql
    - CREATE DATABASE "recipeDB";
    - GRANT ALL PRIVILEGES ON DATABASE "recipeDB" TO postgres;
    - \password postgres (enter the password "$Peelord69" at the resulting prompt without quotes)
6. Run createUser.py then createSession.py then createRecipe.py then createStep.py then createIngredient.py then createAllergen.py then createReview.py then createReviewHelpful.py then createRating.py.
7. type "flask run" in the terminal
8. go to localhost:5000/users in the browser. There should be no errors
