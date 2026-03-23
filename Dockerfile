# Use Python 3.9
FROM python:3.9

# Create a user with ID 1000
RUN useradd -m -u 1000 user

# Set working directory to the user's home app folder
WORKDIR /home/user/app

# Set environment variables
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Copy requirements and install dependencies as the 'user'
COPY --chown=user ./backend/requirements.txt /home/user/app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /home/user/app/requirements.txt

# Copy the rest of the application code
COPY --chown=user . /home/user/app

# Ensure uploads and database permissions are set
RUN mkdir -p /home/user/app/backend/uploads && chmod 777 /home/user/app/backend/uploads
RUN touch /home/user/app/plants.db && chmod 777 /home/user/app/plants.db

# Explicitly switch to the non-root 'user'
USER user

# Expose the standard Hugging Face port
EXPOSE 7860

# Run the backend application
# Use -m to ensure python finds the backend module
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
