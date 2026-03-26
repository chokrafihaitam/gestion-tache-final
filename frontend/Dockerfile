# Development stage
FROM node:18-alpine as development

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source
COPY . .

EXPOSE 3000

CMD ["npm", "start"]

# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Production stage - only for production, not for development
FROM nginx:alpine as production

COPY --from=build /app/build /usr/share/nginx/html
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