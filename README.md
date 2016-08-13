# Overview

The applications project contains sample cloud applications that serve as an 
example of using the VOpen foundation as a platform. They are designed to work 
in a cloud environment and benefit from the VOpen services in order to produce 
new and derived data.

# VOpen Simulator

Simulator application for simulating any data that can be published for a 
particular device.

In order to produce truly artificial simulator without any user-submitted data,
machine learning or declarative approach needs to be used. Using the OSM 
Overpass API, this can be achieved. The Overpass API offers read-only
capabilities to th applications using the OSM database and providing web
access to it. A sample simulator application usng the OSM data would be
to collect all the nodes in the vicinity of a city, get the street nodes out
of them and "drive" a car along those streets. The application would approximate
the movement of the car from node to node, on predefined intervals and 
regularly broadcast its position.

# Simple Time Servlet

Simple time publishing application.