Please install Postgres before using this app. https://www.postgresql.org/download/
First Time Setup
1. Create a terminal
2. cd backend
3. run "pip install -r requirements.txt" in the terminal
4. create a database called "recipeDB" with postgres in the second terminal:
    - sudo -u postgres psql
    - CREATE DATABASE "recipeDB";
    - GRANT ALL PRIVILEGES ON DATABASE "recipeDB" TO postgres;
    - \password postgres (enter the password "$Peelord69" at the resulting prompt without quotes)
5. Run createUser.py then createSession.py then createRecipe.py then createStep.py then createIngredient.py then createAllergen.py then createReview.py then createReviewHelpful.py then createRating.py.

Running the app
7. cd backend
8. flask run
9. open a new terminal
10. cd frontend
11. npm run dev
12. go to localhost:5173 in the browser.
