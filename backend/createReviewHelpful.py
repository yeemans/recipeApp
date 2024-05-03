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
create_review_helpfuls_table = """
CREATE TABLE IF NOT EXISTS reviewHelpfuls (
    id SERIAL PRIMARY KEY,
    review_id INT REFERENCES reviews(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    helpful BOOLEAN DEFAULT TRUE
)
"""
# Execute a command: this creates a new table
cur.execute('DROP TABLE IF EXISTS reviewHelpfuls;')
cur.execute(create_review_helpfuls_table)


conn.commit()

cur.close()
conn.close()