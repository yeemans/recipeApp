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
create_recipes_table = """
CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    chef_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(40) NOT NULL,
    cuisine VARCHAR(40) NOT NUll,
    is_public BOOLEAN DEFAULT TRUE
)
"""
# Execute a command: this creates a new table
cur.execute('DROP TABLE IF EXISTS recipes CASCADE;')
cur.execute(create_recipes_table)


conn.commit()
cur.close()
conn.close()