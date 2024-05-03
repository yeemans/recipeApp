# use conn.commit for queries that change the database

from flask import Flask, jsonify
from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
import psycopg2
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import json
from psycopg2 import sql
import secrets

# Create a Flask app
app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/' 
CORS(app)  # Enable CORS for all origins
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:$Peelord69@localhost/recipeDB'
db = SQLAlchemy(app)

conn = psycopg2.connect(
    dbname='recipeDB',
    user='postgres',
    password='$Peelord69',
    host='localhost'
)

# Define a route for the root endpoint
@app.route('/')
def index():
    return "Welcome to the Flask API!"

# Define a route to test fetch all users
@app.route('/users', methods=['GET'])
def get_users():
    # Create a cursor
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM users")
    users = cur.fetchall()
    cur.close()
    users_json = jsonify(users)
    return users_json

@app.route('/sessions', methods=['GET'])
def get_sessions():
    # Create a cursor
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM sessions")
    sessions = cur.fetchall()
    cur.close()
    sessions_json = jsonify(sessions)
    return sessions_json

@app.route('/recipes', methods=['GET'])
def get_recipes():
    # Create a cursor
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM recipes")
    recipes = cur.fetchall()
    cur.close()
    recipes_json = jsonify(recipes)
    return recipes_json

@app.route('/ingredients', methods=['GET'])
def get_ingredients():
    # Create a cursor
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM ingredients")
    ingredients = cur.fetchall()
    cur.close()
    ingredients_json = jsonify(ingredients)
    return ingredients_json

@app.route('/steps', methods=['GET'])
def get_steps():
    # Create a cursor
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM steps")
    steps = cur.fetchall()
    cur.close()
    steps_json = jsonify(steps)
    return steps_json

@app.route('/allergens', methods=['GET'])
def get_allergens():
    # Create a cursor
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM allergens")
    allergens = cur.fetchall()
    cur.close()
    allergens_json = jsonify(allergens)
    return allergens_json

@app.route('/reviews', methods=['GET'])
def get_reviews():
    # Create a cursor
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM reviews")
    reviews = cur.fetchall()
    cur.close()
    reviews_json = jsonify(reviews)
    return reviews_json

@app.route('/review_helpfuls', methods=['GET'])
def get_review_helpfuls():
    # Create a cursor
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM reviewHelpfuls")
    review_helpfuls = cur.fetchall()
    cur.close()
    review_helpfuls_json = jsonify(review_helpfuls)
    return review_helpfuls_json

@app.route('/ratings', methods=['GET'])
def get_ratings():
    # Create a cursor
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM ratings")
    ratings = cur.fetchall()
    cur.close()
    ratings_json = jsonify(ratings)
    return ratings_json

@app.route('/register', methods=['POST'])
def register():
    session_token = None
    data = json.loads(request.data)
    username = data['username']
    password = data['password']
    password = generate_password_hash(password)

    cur = conn.cursor()
    if check_user_exists(cur, username):
        return jsonify({'message': 'Username is already used.', 'success': False})
    else:
        inserted_user_id = insert_new_user(cur, username, password)
        session_token = create_session(cur, inserted_user_id)

    conn.commit()
    cur.close()
    return jsonify({'session_token': session_token, 'success': True})

@app.route('/login', methods=['POST'])
def login():
    data = json.loads(request.data)
    username = data['username']
    password = data['password']
    cur = conn.cursor()

    if not check_user_exists(cur, username):
        return jsonify({'message': 'Wrong username/password', 'success': False})
    
    if not check_password(cur, username, password):
        return jsonify({'message': 'Wrong username/password', 'success': False})
    
    session_token = create_session(cur, get_user(cur, username))
    conn.commit()
    cur.close()
    return jsonify({'session_token': session_token, 'success': True})

@app.route("/logged_in", methods=['POST'])
def logged_in():
    data = json.loads(request.data)
    username = data['username']
    session_token = data['session_token']
    cur = conn.cursor()

    if not check_user_exists(cur, username):
        print(f"{username} does not exist.")
        return jsonify({'success': False})
    
    session = get_session(cur, username, session_token)
    cur.close()

    if not session: 
        print([username, session_token])
        print(f"session not found")
        return jsonify({'success': False})
    return jsonify({'success': True})

@app.route("/get_bio", methods=['POST'])
def get_bio():
    data = json.loads(request.data)
    username = data['username']
    cur = conn.cursor()

    if not check_user_exists(cur, username):
        return jsonify({'success': False})
    
    bio = get_user_bio(cur, username)
    cur.close()

    return jsonify({'success': True, 'bio': bio})

@app.route("/set_bio", methods=['POST'])
def set_bio():
    data = json.loads(request.data)
    profile_owner = data['profile_owner']
    editor = data['editor']
    bio = data['bio']
    session_token = data['session_token']
    cur = conn.cursor()

    # check if user is logged in
    if not check_user_exists(cur, profile_owner) or not check_user_exists(cur, editor):
        return jsonify({'success': False})
    
    if not get_session(cur, editor, session_token):
        return jsonify({'success': False})
    
    # make sure editor is profile_owner
    if get_user(cur, profile_owner) != get_user(cur, editor):
        return jsonify({'success': False})
    
    update_bio(cur, get_user(cur, profile_owner), bio)
    conn.commit()
    cur.close()
    return jsonify({'success': True})

@app.route("/create_recipe", methods=['POST'])
def create_recipe():
    cur = conn.cursor()
    data = json.loads(request.data)
    chef_id = get_user(cur, data["username"])
    title = data["title"]
    cuisine = data["cuisine"]
    is_public = data["is_public"]

    sql_insert = """
    INSERT INTO recipes (chef_id, title, cuisine, is_public)
    VALUES (%s, %s, %s, %s)
    RETURNING id
    """

    cur.execute(sql_insert, (chef_id, title, cuisine, is_public,))
    recipe_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    return {'success': True, 'recipe_id': recipe_id}

@app.route("/create_ingredient", methods=['POST'])
def create_ingredient():
    cur = conn.cursor()
    data = json.loads(request.data)
    recipe_id = data["recipe_id"]
    name = data["name"]

    sql_insert = """
    INSERT INTO ingredients (recipe_id, name)
    VALUES (%s, %s)
    RETURNING id
    """

    cur.execute(sql_insert, (recipe_id, name,))
    ingredient_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    return {'success': True, 'ingredient_id': ingredient_id}

@app.route("/create_step", methods=['POST'])
def create_step():
    cur = conn.cursor()
    data = json.loads(request.data)
    recipe_id = data["recipe_id"]
    html = data["html"]

    sql_insert = """
    INSERT INTO steps (recipe_id, html)
    VALUES (%s, %s)
    RETURNING id
    """

    cur.execute(sql_insert, (recipe_id, html,))
    conn.commit()
    cur.close()
    return {'success': True}

@app.route("/create_allergen", methods=['POST'])
def create_allergen():
    cur = conn.cursor()
    data = json.loads(request.data)
    recipe_id = data["recipe_id"]
    name = data["name"]

    sql_insert = """
    INSERT INTO allergens (recipe_id, name)
    VALUES (%s, %s)
    RETURNING id
    """

    cur.execute(sql_insert, (recipe_id, name,))
    conn.commit()
    cur.close()
    return {'success': True}

@app.route("/get_user_recipes", methods=['POST'])
def get_all_user_recipes():
    cur = conn.cursor()
    data = json.loads(request.data)
    username = data["username"]
    user_id = get_user(cur, username) # get user id from username
    get_only_public = data["get_only_public"]

    print(get_only_public)
    query = "SELECT * FROM recipes WHERE chef_id = %s"
    if get_only_public:
        query = "SELECT * FROM recipes WHERE chef_id = %s AND is_public = true"
    cur.execute(query, (user_id,))
    recipes = cur.fetchall()

    cur.close()
    return {"success": True, "recipes": recipes}

@app.route("/get_recipe_by_id", methods=['POST'])
def get_recipe_by_id():
    cur = conn.cursor()
    sql_select = """
    SELECT * FROM recipes 
    WHERE id = %s
    """
    data = json.loads(request.data)
    id = data["id"]

    cur.execute(sql_select, (id,))
    recipe = cur.fetchall()[0]
    cur.close()
    return {"success": True, "recipe": recipe}

@app.route("/get_recipe_ingredients", methods=['POST'])
def get_recipe_ingredients():
    cur = conn.cursor()
    sql_select = """
    SELECT * FROM ingredients 
    WHERE recipe_id = %s
    """
    data = json.loads(request.data)
    recipe_id = data["recipe_id"]

    cur.execute(sql_select, (recipe_id,))
    ingredients = cur.fetchall()
    cur.close()
    return {"success": True, "ingredients": ingredients}

@app.route("/get_recipe_allergens", methods=['POST'])
def get_recipe_allergens():
    cur = conn.cursor()
    sql_select = """
    SELECT * FROM allergens
    WHERE recipe_id = %s
    """
    data = json.loads(request.data)
    recipe_id = data["recipe_id"]

    cur.execute(sql_select, (recipe_id,))
    allergens = cur.fetchall()
    cur.close()
    return {"success": True, "allergens": allergens}

@app.route("/get_recipe_steps", methods=['POST'])
def get_recipe_steps():
    cur = conn.cursor()
    sql_select = """
    SELECT * FROM steps
    WHERE recipe_id = %s
    """
    data = json.loads(request.data)
    recipe_id = data["recipe_id"]

    cur.execute(sql_select, (recipe_id,))
    steps = cur.fetchall()
    cur.close()
    return {"success": True, "steps": steps}

@app.route("/get_recipe_reviews", methods=['POST'])
def get_recipe_reviews():
    cur = conn.cursor()
    sql_select = """
    SELECT reviews.id, reviews.user_id, username, body
    FROM reviews
    JOIN users ON users.id = reviews.user_id
    WHERE recipe_id = %s
    """
    data = json.loads(request.data)
    recipe_id = data["recipe_id"]

    cur.execute(sql_select, (recipe_id,))
    reviews = cur.fetchall()
    print(reviews)
    cur.close()
    return {"success": True, "reviews": reviews}

@app.route("/owns_recipe", methods=['POST'])
def owns_recipe():
    cur = conn.cursor()
    data = json.loads(request.data)
    username = data["username"]
    recipe_id = data["recipe_id"]

    user_id = get_user(cur, username)
    if not user_id: return {'success': False}

    recipe_owner = get_recipe_owner(cur, recipe_id)
    success = user_id == recipe_owner

    return {'success': success}

@app.route("/create_review", methods=['POST'])
def create_review():
    cur = conn.cursor()
    data = json.loads(request.data)
    recipe_id = data["recipe_id"]
    review_body = data["review_body"]
    username = data["username"]

    user_id = get_user(cur, username)
    if not user_id: return {'success': False}

    # delete existing review for this recipe by user
    delete_review(cur, recipe_id, user_id)
    create_review(cur, recipe_id, user_id, review_body)
    conn.commit()
    cur.close()
    return {'success': True}

@app.route("/mark_helpful", methods=['POST'])
def mark_helpful():
    cur = conn.cursor()
    data = json.loads(request.data)
    review_id = data["review_id"]
    username = data["username"]
    helpful = data["helpful"]

    if not username: return {'success': False}
    user_id = get_user(cur, username)
    if not user_id: return {'success': False}
    # delete existing review for this recipe by user
    delete_review_helpful(cur, review_id, user_id)
    create_review_helpful(cur, review_id, user_id, helpful)
    conn.commit()
    cur.close()
    return {'success': True}

@app.route("/get_review_helpful_counts", methods=['POST'])
def get_review_helpful_counts():
    cur = conn.cursor()
    helpful_select = """
    SELECT id FROM reviewHelpfuls WHERE review_id = %s AND helpful = TRUE
    """

    unhelpful_select = "SELECT id FROM reviewHelpfuls WHERE review_id = %s AND helpful = FALSE"
    data = json.loads(request.data)
    review_id = data["review_id"]

    cur.execute(helpful_select, (review_id,))
    helpfuls = len(cur.fetchall())

    cur.execute(unhelpful_select, (review_id,))
    unhelpfuls = len(cur.fetchall())
    cur.close()
    return {"success": True, "helpful": helpfuls, "unhelpful": unhelpfuls}

@app.route("/submit_rating", methods=['POST'])
def submit_rating():
    cur = conn.cursor()
    data = json.loads(request.data)
    recipe_id = data["recipe_id"]
    username = data["username"]
    rating = data["rating"]

    print(data)
    user_id = get_user(cur, username)
    if not user_id: return {'success': False}

    # delete existing review for this recipe by user
    delete_rating(cur, recipe_id, user_id)
    create_rating(cur, recipe_id, user_id, rating)

    conn.commit()
    cur.close()
    return {'success': True}

@app.route("/average_rating", methods=['POST'])
def get_average_rating():
    sql_select = """
    SELECT AVG(rt.rating) AS average_rating
    FROM recipes r
    JOIN ratings rt ON r.id = rt.recipe_id
    WHERE r.id = %s
    GROUP BY r.id;
    """

    cur = conn.cursor()
    data = json.loads(request.data)
    recipe_id = data["recipe_id"]
    cur.execute(sql_select, (recipe_id,))
    average_rating = cur.fetchone()

    print(average_rating)
    return {"success": True, "averageRating": average_rating}


def check_user_exists(cur, username):
    query = sql.SQL("SELECT 1 FROM users WHERE username = {}").format(sql.Literal(username))
    cur.execute(query)

    user_exists = cur.fetchone() is not None
    return user_exists

def check_password(cur, username, login_password):
    query = sql.SQL("SELECT password FROM users WHERE username = {}").format(sql.Literal(username))
    cur.execute(query)

    database_password = cur.fetchone()[0]
    return check_password_hash(database_password, login_password)

def insert_new_user(cur, username, password):
    BLANK_BIO = ""
    sql_insert = """
    INSERT INTO users (username, password, bio)
    VALUES (%s, %s, %s)
    RETURNING id
    """
    cur.execute(sql_insert, (username, password, BLANK_BIO,))
    inserted_user_id = cur.fetchone()[0]
    return inserted_user_id

def delete_review(cur, recipe_id, user_id):
    sql_delete = """
    DELETE FROM reviews
    WHERE recipe_id = %s AND user_id = %s
    """   
    cur.execute(sql_delete, (recipe_id, user_id,))
     
def create_review(cur, recipe_id, user_id, review_body):
    sql_insert = """
    INSERT INTO reviews (recipe_id, user_id, body)
    VALUES (%s, %s, %s)
    RETURNING id
    """
    cur.execute(sql_insert, (recipe_id, user_id, review_body,))
    return cur.fetchone()[0]

def delete_review_helpful(cur, review_id, user_id):
    sql_delete = """
    DELETE FROM reviewHelpfuls
    WHERE review_id = %s AND user_id = %s
    """   
    cur.execute(sql_delete, (review_id, user_id,))
     
def create_review_helpful(cur, review_id, user_id, helpful):
    sql_insert = """
    INSERT INTO reviewHelpfuls (review_id, user_id, helpful)
    VALUES (%s, %s, %s)
    RETURNING id
    """
    cur.execute(sql_insert, (review_id, user_id, helpful,))
    return cur.fetchone()[0]

def delete_rating(cur, recipe_id, user_id):
    sql_delete = """
    DELETE FROM ratings
    WHERE recipe_id = %s AND user_id = %s
    """   
    cur.execute(sql_delete, (recipe_id, user_id,))

def create_rating(cur, recipe_id, user_id, rating):
    sql_insert = """
    INSERT INTO ratings (recipe_id, user_id, rating)
    VALUES (%s, %s, %s)
    RETURNING id
    """
    cur.execute(sql_insert, (recipe_id, user_id, rating,))
    return cur.fetchone()[0]

def get_user(cur, username):
    sql_insert = """
    SELECT id FROM users 
    WHERE username = %s
    """
    cur.execute(sql_insert, (username,))
    user_id = cur.fetchone()
    if user_id: return user_id[0]
    return None

def get_user_bio(cur, username):
    sql_insert = """
    SELECT bio FROM users 
    WHERE username = %s
    """
    cur.execute(sql_insert, (username,))
    user_bio = cur.fetchone()[0]
    return user_bio

def create_session(cur, inserted_user_id):
    sql_insert = """
    INSERT INTO sessions (user_id, session_token)
    VALUES (%s, %s);
    """
    session_token = secrets.token_hex(16)
    cur.execute(sql_insert, (inserted_user_id, session_token))
    return session_token

def get_session(cur, username, session_token):
    sql_insert = """
    SELECT * FROM sessions 
    WHERE user_id = %s AND session_token = %s
    """
    cur.execute(sql_insert, (get_user(cur, username), session_token,))
    return cur.fetchone() is not None # returns boolean for SELECT success

def get_recipe_owner(cur, recipe_id):
    sql_insert = """
    SELECT chef_id FROM recipes 
    WHERE id = %s
    """
    cur.execute(sql_insert, (recipe_id, ))
    return cur.fetchone()[0]

def update_bio(cur, user_id, new_bio):
    sql_insert = """
    UPDATE users
    SET bio = %s 
    WHERE id = %s;
    """
    return cur.execute(sql_insert, (new_bio, user_id,))
    # returns whether or not update success

if __name__ == '__main__':
    app.run(debug=True)
