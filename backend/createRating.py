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
create_ratings_table = """
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 1
)
"""
# Execute a command: this creates a new table
cur.execute('DROP TABLE IF EXISTS ratings;')
cur.execute(create_ratings_table)


conn.commit()

cur.close()
conn.close()