import os
import psycopg2

conn = psycopg2.connect(
        host="localhost",
        database="recipeDB",
        user="postgres",
        password="$Peelord69"
)

# Open a cursor to perform database operations
cur = conn.cursor()
create_reviews_table = """
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    body VARCHAR NOT NULL
)
"""
# Execute a command: this creates a new table
cur.execute('DROP TABLE IF EXISTS reviews;')
cur.execute(create_reviews_table)


conn.commit()

cur.close()
conn.close()