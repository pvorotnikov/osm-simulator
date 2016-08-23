# Set the base image to Ubuntu
FROM ubuntu:latest

# File Author / Maintainer
MAINTAINER Petar Vorotnikov

# Create workdir
RUN mkdir -p /opt/app

# Define working directory
WORKDIR /opt/app
ADD . /opt/app

# Run app using nodemon
CMD ["python", "main.py"]
