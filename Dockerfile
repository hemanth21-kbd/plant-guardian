# Use Slim Python image for speed and reliability
FROM python:3.9-slim

# Install minimal system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m -u 1000 user
WORKDIR /home/user/app

# Set environment variables
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONPATH=/home/user/app \
    PORT=7860

# Install dependencies
COPY --chown=user ./backend/requirements.txt /home/user/app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /home/user/app/requirements.txt

# Copy everything else
COPY --chown=user . /home/user/app

# Permissions for database and uploads
RUN mkdir -p /home/user/app/backend/uploads && chmod 777 /home/user/app/backend/uploads
RUN touch /home/user/app/plants.db && chmod 777 /home/user/app/plants.db

USER user

# Use the exact module path HF expects
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1"]
