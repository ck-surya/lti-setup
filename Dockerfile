FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies first (for caching)
COPY package*.json ./
RUN npm install

# Copy the rest of your app code
COPY . .

# Expose the app port
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
