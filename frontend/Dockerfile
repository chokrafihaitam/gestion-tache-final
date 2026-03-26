# Development stage
FROM node:18-alpine as development

WORKDIR /app

COPY package*.json ./
# Remplacer npm ci par npm install
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage with nginx
FROM nginx:alpine as production

COPY --from=build /app/build /usr/share/nginx/html

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