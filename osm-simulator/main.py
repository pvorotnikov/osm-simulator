
#!/usr/bin/env python

# ###############################
# @author Petar Vorotnikov
# ###############################

import overpy
import logging, argparse, sys, time
from worker import Worker
from osmtypes import Way, Node
import threading
import logger

# program constants
DEFAULT_LOGGING_FORMAT = "%(message)s"
VERBOSE_LOGGING_FORMAT = "%(levelname)s: %(message)s"
PROGRAM = 'osm-simulator'
VERSION = '1.0.0'

# Main routine
def main() :

    # Get arguments
    parser = argparse.ArgumentParser(prog=PROGRAM, description=__doc__)
    parser.add_argument('-c', '--place', metavar='PLACE_NAME', help="place name", default='Stara Zagora')
    parser.add_argument('-r', '--range', metavar='int', type=int, help="range (in meters)", default=1000)
    parser.add_argument('-w', '--workers', metavar='NUMBER', type=int, help="number of workers", default=1)
    parser.add_argument('-x', '--verbose', action='store_true', help="enable verbose logging")
    parser.add_argument('-v', '--version', action='version', version=VERSION)
    args = parser.parse_args()

    # Set logging level
    if args.verbose:
        logging.basicConfig(stream=sys.stdout, format=VERBOSE_LOGGING_FORMAT, level=logging.DEBUG)
    else:
        logging.basicConfig(stream=sys.stdout, format=DEFAULT_LOGGING_FORMAT, level=logging.INFO)


    # Fetch the data
    logger.info('Calling Overpass API...')
    api = overpy.Overpass()
    query = ('[out:json];'
        'area["int_name"="Bulgaria"];'
        'node["int_name"="{place}"]["place"="city"](area);'
        'way["highway"](around:{range});'
        '(._;>;);out meta;')
    query = query.format(place=args.place, range=args.range)
    logger.info('Query: {0}'.format(query))
    result = api.query(query)


    # create workers
    logger.info('Creating {0} workers...'.format(args.workers))
    ways, nodes = createRelations(result)
    worker_threads = []
    for i in range(args.workers) :
        thread = threading.Thread(target=createWorker, args=[ways, nodes, result])
        thread.daemon = True
        thread.start()
        worker_threads.append(thread)


    # allow the threads to run as daemons
    while True :
        time.sleep(1)


def createWorker(ways, nodes, result) :
    worker = Worker(ways, nodes, result)
    worker.start()

# Create data relations
def createRelations(result) :

    logger.info('Creating relationships...')

    ways = {}
    nodes = {}

    # create node to ways relation
    for way in result.ways :
        # create entry for way in ways
        if not way.id in ways :
            ways[way.id] = Way(way.id, way.nodes)
        # create entry for node in nodes
        for node in way.nodes :
            if not node.id in nodes :
                nodes[node.id] = Node(node.id, node.lat, node.lon, [])
            # append way to node
            nodes[node.id].ways.append(way)

    return (ways, nodes)

# Execute main
if __name__ == '__main__':
    main()
