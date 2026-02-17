FROM node:20-alpine

WORKDIR /app

# Copy package.json first for better caching
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code and tests
COPY src ./src
COPY tests ./tests
COPY tsconfig.json ./

# Run tests by default
CMD ["npm", "test"]
