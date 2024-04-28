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

# Execute a command: this creates a new table
cur.execute('DROP TABLE IF EXISTS users;')
cur.execute('CREATE TABLE users (id serial PRIMARY KEY,'
                                 'username varchar (20) NOT NULL,'
                                 'password varchar (300) NOT NULL);'
            )

# Insert data into the table
print(cur.execute('INSERT INTO users (username, password)'
            'VALUES (%s, %s)',
            ('soup',
             'spoon')
            ))

conn.commit()

cur.close()
conn.close()