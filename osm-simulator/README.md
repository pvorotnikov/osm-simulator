##  How to build Docker images from the source

```bash
# worker
cd worker; docker build -t osm-simulator:latest .

# gui
cd gui; docker build -t osm-gui:latest .
```

## How to run Docker container with the simulator:

```bash
# if you have reverse proxy
docker run -d -p 127.0.0.1:3000:3000 osm-gui

# if you want the gui to handle requests directly
docker run -d -p 3000:3000 osm-gui

# run simulator worker
docker run -d -e CITY=Burgas osm-simulator
```

## Simulator Algorithm

1 Fetch City Nodes
2 For selected city node get all highway nodes of type way in supplied radius
3 Start at the first node of random way
4 Travel at speed close to the maximum with negative deviation for randomness
5 Calculate the distance of the way first - last point. This is needed for interpolating.
6 On end node turn at random joint road and repeat steps 4 - 7
7 If there's no joint road, turn back

## Get all cities in Bulgaria
```
[out:json];
area
  [int_name="Bulgaria"];
node
  [place=city]
  (area);
out;
```

## Get all ways and nodes in Stara Zagora, Bulgaria within 1km radius
```
[out:json];

/* search in Bulgaria */
area
  [int_name="Bulgaria"];
/* search for Stara Zagora in Bulgaria */
node
  [int_name="Stara Zagora"]
  [place=city]
  (area);
/* search for ways in 1km radius */
way["highway"]
    (around:1000);
/* include nodes */
(._;>;);

out;
```
