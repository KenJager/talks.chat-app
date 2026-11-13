# Build stage
FROM node:18-alpine as build

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the app
RUN pnpm run build

# Production stage
FROM node:18-alpine

# Install serve globally
RUN npm install -g serve

# Copy built app
COPY --from=build /app/dist /app/dist

# Expose port
EXPOSE 3000

# Serve the app
CMD ["serve", "-s", "/app/dist", "-l", "3000"]