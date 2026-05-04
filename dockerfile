# 1. Start with a lightweight, official Node.js image
FROM node:20-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy ONLY package files first (This makes building faster later)
COPY package*.json ./

# 4. Install production dependencies (and tsx for running our code)
RUN npm install

# 5. Copy the rest of your source code
COPY . .

# 6. Expose the port your Express server uses
EXPOSE 3000

# 7. The command to start your app
CMD ["npm", "run", "dev"]