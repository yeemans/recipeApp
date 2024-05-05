import mysql.connector

mysql_config = {
    'host': 'localhost',
    'user': 'new_user',
    'password': 'password',
    'database': 'recipeDB'
}

conn = mysql.connector.connect(**mysql_config)
# Open a cursor to perform database operations
cur = conn.cursor()

# Create users table
cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(20) NOT NULL,
        password VARCHAR(300) NOT NULL,
        bio VARCHAR(300) NOT NULL
    )
""")
conn.commit()

# Create sessions table with correct data type for user_id
cur.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        session_token VARCHAR(100) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
""")
conn.commit()


cur.execute("""
CREATE TABLE IF NOT EXISTS recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chef_id INT,
    title VARCHAR(40) NOT NULL,
    cuisine VARCHAR(40) NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (chef_id) REFERENCES users(id) ON DELETE CASCADE
);
""")
conn.commit()

create_reviews_table = """
    CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        body VARCHAR(1000) NOT NULL,
        recipe_id INT,
        user_id INT,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
"""
cur.execute(create_reviews_table)
conn.commit()

cur.execute("""
CREATE TABLE IF NOT EXISTS ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(1000) NOT NULL,
    recipe_id INT,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
)
""")
conn.commit()

cur.execute("""
CREATE TABLE IF NOT EXISTS steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    html VARCHAR(1000) NOT NULL,
    recipe_id INT,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
)
""")
conn.commit()

cur.execute("""
CREATE TABLE IF NOT EXISTS allergens (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    recipe_id INT,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
)
""")
conn.commit()

cur.execute("""
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 1,
    recipe_id INT,
    user_id INT,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
""")
conn.commit()

cur.execute("""
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    body VARCHAR(100) NOT NULL,
    recipe_id INT,
    user_id INT,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS reviewHelpfuls (
    id SERIAL PRIMARY KEY,
    helpful BOOLEAN DEFAULT TRUE,
    review_id INT,
    user_id INT,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
""")
conn.commit()

cur.execute("""
CREATE TABLE IF NOT EXISTS collaborations (
    id SERIAL PRIMARY KEY,
    recipe_id INT,
    user_id INT,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
""")
conn.commit()

cur.execute("""
    CREATE TABLE IF NOT EXISTS savedRecipes (
    id SERIAL PRIMARY KEY,
    recipe_id INT,
    user_id INT,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
""")

cur.close()
conn.close()