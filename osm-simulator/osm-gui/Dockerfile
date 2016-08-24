# Set the base image to Node
FROM node:latest

# File Author / Maintainer
MAINTAINER Petar Vorotnikov

# Install nodemon
RUN npm install -g nodemon

# Create workdir
RUN mkdir -p /usr/src/app

# Add files to workdir
ADD . /usr/src/app

RUN cd /usr/src/app && npm install
RUN npm run build

# Define working directory
WORKDIR /usr/src/app

# Expose port
EXPOSE 3000

# Run app using nodemon
CMD ["nodemon", "server.js"]
