# Set the base image to Node
FROM node:latest

# File Author / Maintainer
MAINTAINER Petar Vorotnikov

# Install nodemon
RUN npm install -g nodemon

# Provides cached layer for node_modules
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app/

# Define working directory
WORKDIR /usr/src/app

# Add files to workdir
ADD . /usr/src/app

# Add bower dependencies
RUN cd /usr/src/app && npm run postinstall

# Build the app
RUN cd /usr/src/app && npm run build

# Expose port
EXPOSE 3000

# Run app using nodemon
CMD ["nodemon", "server.js"]
