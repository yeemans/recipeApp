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
create_sessions_table = """
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(100) NOT NULL
)
"""
# Execute a command: this creates a new table
cur.execute('DROP TABLE IF EXISTS sessions;')
cur.execute(create_sessions_table)


conn.commit()

cur.close()
conn.close()