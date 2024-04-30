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

def get_user(cur, username):
    sql_insert = """
    SELECT id FROM users 
    WHERE username = %s
    """
    cur.execute(sql_insert, (username,))
    user_id = cur.fetchone()[0]
    return user_id

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
