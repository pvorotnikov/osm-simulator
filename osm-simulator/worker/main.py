
#!/usr/bin/env python

# ###############################
# @author Petar Vorotnikov
# ###############################

import overpy
import logging, argparse, sys, time, os, json
from worker import Worker
from osmtypes import Way, Node
from threading import Thread, Timer, Event
import logger
import requests
from requests.auth import HTTPBasicAuth

# program constants
DEFAULT_LOGGING_FORMAT = "%(message)s"
VERBOSE_LOGGING_FORMAT = "%(levelname)s: %(message)s"
PROGRAM = 'osm-simulator'
VERSION = '1.0.0'

sim_registry = [];
api_key_registry = {}
worker_threads = {};

# Main routine
def main() :

    # Get arguments
    parser = argparse.ArgumentParser(prog=PROGRAM, description=__doc__)
    parser.add_argument('-c', '--place', metavar='PLACE_NAME', help="place name", default=os.getenv('CITY', 'Sofia'))
    parser.add_argument('-r', '--range', metavar='int', type=int, help="range (in meters)", default=1000)
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
    # TODO: include only road ways
    query = ('[out:json];'
        'area["int_name"="Bulgaria"];'
        'node["int_name"="{place}"]["place"="city"](area);'
        'way["highway"](around:{range});'
        '(._;>;);out meta;')
    query = query.format(place=args.place, range=args.range)
    logger.info('Query: {0}'.format(query))
    result = api.query(query)
    ways, nodes = createRelations(result)

    while True :
        renewSimRegistry()
        renewWorkers(ways, nodes, result)
        time.sleep(10);


# Create data relations
def createRelations(result) :

    logger.info('Creating relationships...')

    ways = {}
    nodes = {}

    # create node to ways relation
    for way in result.ways :
        # create entry for way in ways
        if not way.id in ways :
            # TODO: remove manual exclusion once the Overpass query is modified
            # skip footways
            if way.tags['highway'] is 'footway' :
                pass
            ways[way.id] = Way(way.id, way.nodes)
        # create entry for node in nodes
        for node in way.nodes :
            if not node.id in nodes :
                nodes[node.id] = Node(node.id, node.lat, node.lon, [])
            # append way to node
            nodes[node.id].ways.append(way)

    return (ways, nodes)



# Check the registered simulators
def renewSimRegistry() :

    global sim_registry
    global api_key_registry

    publicKey = os.getenv('PUBLIC_KEY', '<public-key>')
    apiKey = os.getenv('API_KEY', '<api-key>')
    response = requests.get('http://api.vopen.org/simulator', auth=HTTPBasicAuth(publicKey, apiKey))
    
    if response.ok :
        data = json.loads(response.content)
        sim_registry = []
        api_key_registry = {}

        for sim in data['data'] :
            if sim['isRunning'] :
                sim_registry.append(sim['id'])
                api_key_registry[sim['id']] = (sim['publicKey'], sim['apiKey'])
    else :
        logger.error('Error fetching simulator data from VOpen API')



# Update worker threads
def renewWorkers(ways, nodes, result) :

    global sim_registry
    global worker_threads

    to_add = []
    to_remove = []

    for sim in sim_registry :
        if not sim in worker_threads :
            logging.info('Should start thread: {0}'.format(sim))
            to_add.append(sim)

    for thread in worker_threads :
        if not thread in sim_registry :
            logging.info('Should stop thread: {0}'.format(thread))
            to_remove.append(thread)

    for i in to_add :
        stop_event = Event()
        publicKey, apiKey = api_key_registry[i]
        thread = Thread(target=Worker, args=[ways, nodes, result, stop_event, publicKey, apiKey])
        thread.daemon = True
        thread.start()
        worker_threads[i] = (thread, stop_event)

    for i in to_remove :
        thread, stop_event = worker_threads[i]
        stop_event.set()
        del worker_threads[i]


# Execute main
if __name__ == '__main__':
    main()
