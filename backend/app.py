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

@app.route('/register', methods=['GET', 'POST'])
def register():
    session_token = None
    data = json.loads(request.data)
    username = data['username']
    password = data['password']
    password = generate_password_hash(password)

    cur = conn.cursor()
    if check_user_exists(username):
        return jsonify({'message': 'Username is already used.', 'success': False})
    else:
        inserted_user_id = insert_new_user(cur, username, password)
        session_token = create_session(cur, inserted_user_id)

    conn.commit()
    cur.close()
    return jsonify({'session_token': session_token, 'success': True})

def check_user_exists(username):
    cur = conn.cursor()
    query = sql.SQL("SELECT 1 FROM users WHERE username = {}").format(sql.Literal(username))
    cur.execute(query)

    user_exists = cur.fetchone() is not None
    cur.close()
    return user_exists

def insert_new_user(cur, username, password):
    sql_insert = """
    INSERT INTO users (username, password)
    VALUES (%s, %s)
    RETURNING id
    """
    cur.execute(sql_insert, (username, password))
    inserted_user_id = cur.fetchone()[0]
    return inserted_user_id

def create_session(cur, inserted_user_id):
        sql_insert = """
        INSERT INTO sessions (user_id, session_token)
        VALUES (%s, %s);
        """

        session_token = secrets.token_hex(16)
        cur.execute(sql_insert, (inserted_user_id, session_token))
        return session_token

if __name__ == '__main__':
    app.run(debug=True)
