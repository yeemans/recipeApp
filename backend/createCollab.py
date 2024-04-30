import os
import psycopg2

# Connect to the database
conn = psycopg2.connect(
    host="localhost",
    database="recipeDB",
    user="postgres",
    password="$Peelord69"
)

# Open a cursor to perform database operations
cur = conn.cursor()

# Create users table if not exists
cur.execute('CREATE TABLE IF NOT EXISTS users (id serial PRIMARY KEY,'
            'username varchar (20) NOT NULL,'
            'password varchar (300) NOT NULL,'
            'bio varchar (300) NOT NULL);')

# Create collaboration table
cur.execute('CREATE TABLE IF NOT EXISTS collaboration ('
            'id serial PRIMARY KEY,'
            'user_id integer REFERENCES users(id),'
            'recipe_id integer REFERENCES recipes(id),')

# Commit changes
conn.commit()

# Close cursor and connection
cur.close()
conn.close()
