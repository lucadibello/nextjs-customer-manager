# Dockerfile for NextJS app with typescript

# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy everything from current directory to working directory
COPY . .

# Install dependencies
RUN yarn install

# Generate prisma client
RUN yarn prisma generate

# Build app
RUN yarn build

# Push prisma schema
RUN yarn prisma migrate deploy

# Expose port
EXPOSE 3000

# Start app
CMD ["yarn", "start"]

# Path: docker-compose.yml