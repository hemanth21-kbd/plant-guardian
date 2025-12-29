
# Use Python 3.9
FROM python:3.9

# Set working directory
WORKDIR /code

# Copy the requirements file
COPY ./backend/requirements.txt /code/requirements.txt

# Install dependencies
# We install --no-cache-dir to keep the image small
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the backend code and models
COPY ./backend /code/backend
COPY ./models /code/models

# Create uploads directory inside the container
RUN mkdir -p /code/backend/uploads
RUN chmod 777 /code/backend/uploads

# Create a clean database (or you can copy your existing one if you want initial data)
# COPY ./plants.db /code/plants.db 

# Set permissions for the database so it can be written to
# RUN chmod 777 /code/plants.db

# Expose the port Hugging Face expects (7860)
EXPOSE 7860

# Run the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
