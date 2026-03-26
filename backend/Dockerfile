# Development stage
FROM python:3.11-slim as development

WORKDIR /app

# Install system dependencies - AJOUT DE libmariadb-dev
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    python3-dev \
    default-libmysqlclient-dev \
    pkg-config \
    libmariadb-dev \
    libmariadb-dev-compat \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

# Production stage
FROM python:3.11-slim as production

WORKDIR /app

# Install system dependencies for production
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    default-libmysqlclient-dev \
    pkg-config \
    libmariadb-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    && wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip \
    && unzip sonar-scanner-cli-5.0.1.3006-linux.zip \
    && mv sonar-scanner-5.0.1.3006-linux /opt/sonar-scanner \
    && ln -s /opt/sonar-scanner/bin/sonar-scanner /usr/local/bin/sonar-scanner

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]

# Installation du scanner SonarQube
# Development stage
# FROM python:3.11-slim as development

# WORKDIR /app

# # Install system dependencies
# RUN apt-get update && apt-get install -y \
#     gcc \
#     default-libmysqlclient-dev \
#     pkg-config \
#     && rm -rf /var/lib/apt/lists/*

# # Install Python dependencies
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# # Copy entrypoint script
# COPY entrypoint.sh /entrypoint.sh
# RUN chmod +x /entrypoint.sh

# ENTRYPOINT ["/entrypoint.sh"]

# # Production stage
# FROM python:3.11-slim as production

# WORKDIR /app

# RUN apt-get update && apt-get install -y \
#     default-libmysqlclient-dev \
#     && rm -rf /var/lib/apt/lists/*

# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# COPY . .

# RUN python manage.py collectstatic --noinput

# EXPOSE 8000

# CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]