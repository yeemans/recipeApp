# Use a Python image as the base image
FROM python:3.9

# Set the working directory inside the container
WORKDIR /app

# Copy and install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the Flask app will run on
EXPOSE 5000

# Command to start the Flask server
CMD ["python3", "app.py"]
