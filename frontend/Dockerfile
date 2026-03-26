# Development stage
FROM node:18-alpine as development

WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer TOUTES les dépendances (y compris devDependencies)
RUN npm install --legacy-peer-deps

# Copier le code source
COPY . .

EXPOSE 3000

CMD ["npm", "start"]

# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer TOUTES les dépendances
RUN npm install --legacy-peer-deps

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine as production

# Copier les fichiers build
COPY --from=build /app/build /usr/share/nginx/html

# Copier la configuration nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
# FROM node:18-alpine as development

# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .

# EXPOSE 3000

# CMD ["npm", "start"]

# # Build stage
# FROM node:18-alpine as build

# WORKDIR /app

# COPY package*.json ./
# RUN npm ci

# COPY . .
# RUN npm run build

# # Production stage with nginx
# FROM nginx:alpine as production

# COPY --from=build /app/build /usr/share/nginx/html

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]