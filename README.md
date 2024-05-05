Please install Postgres before using this app. https://www.postgresql.org/download/
First Time Setup
1. Create a terminal
2. cd backend
3. run "pip install -r requirements.txt" in the terminal

4. Create a new user called "new_user" with password "password":
    - sudo mysql -u root
    - CREATE USER 'new_user'@'localhost' IDENTIFIED BY 'password';

5. Create recipeDB:
    - CREATE DATABASE IF NOT EXISTS recipeDB;
    - GRANT ALL PRIVILEGES ON recipeDB.* TO 'new_user'@'localhost';
    - control + z

6. Run createTables.py

Running the app
7. cd backend
8. flask run
9. open a new terminal
10. cd frontend
11. npm i
12. npm run dev
13. go to localhost:5173 in the browser.
