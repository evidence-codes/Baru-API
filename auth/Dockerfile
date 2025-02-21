 # Use an official Node.js image as base
FROM node:20

# Set the working directory inside the container
WORKDIR /src

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the service runs on
EXPOSE 4001

# Start the application
CMD ["npm", "start"]
