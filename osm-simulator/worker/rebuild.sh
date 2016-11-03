#!/bin/sh

docker stop vopen_sim
docker rm vopen_sim
docker build -t vopen-sim:latest .
docker run -d --name vopen_sim vopen-sim
