# Use the official Node.js image as a parent image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system -g node && adduser --system --group node

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the built application from the base stage
COPY --from=base /app/.next /app/.next
COPY --from=base /app/public /app/public

# Change ownership of the app directory to the node user
RUN chown -R node:node /app

# Switch to the non-root user
USER node

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
