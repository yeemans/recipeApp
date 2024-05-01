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
create_ingredients_table = """
CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL
)
"""
# Execute a command: this creates a new table
cur.execute('DROP TABLE IF EXISTS ingredients;')
cur.execute(create_ingredients_table)


conn.commit()

cur.close()
conn.close()