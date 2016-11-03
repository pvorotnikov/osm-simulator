import random, time, uuid
import logger
import math
from threading import Thread
from multiprocessing import Queue
from publisher import Publisher
from osmtypes import Coords

class Worker(object) :
    """docstring for Worker"""
    def __init__(self, ways, nodes, raw_result, stop_event, publicKey, apiKey):
        super(Worker, self).__init__()

        self.uuid = uuid.uuid4()
        self.ways = ways
        self.nodes = nodes
        self.result = raw_result
        self.stop_event = stop_event
        self.current_way = None
        self.current_node = None
        self.current_coords = None
        self.current_coords_list = None
        self.next_way = None
        self.next_node = None
        self.direction_forward = True
        self.sleep_interval = 5
        self.speed = 30

        # communication
        self.publisherQueue = Queue()
        self.publisherThread = Thread(target=Publisher, args=(str(self.uuid), self.publisherQueue, publicKey, apiKey, ))
        self.publisherThread.start()


        logger.info('Creating worker...', self)
        self.start()


    """ measure distance between two nodes """
    def distance(self, nodeA, nodeB) :
        rad_per_deg = math.pi / 180  # PI / 180
        rkm = 6371                   # Earth radius in kilometers
        rm = rkm * 1000              # Radius in meters

        a =  [float(nodeA.lat), float(nodeA.lon)]
        b =  [float(nodeB.lat), float(nodeB.lon)]

        dlon_rad = (b[1] - a[1]) * rad_per_deg  # Delta, converted to rad
        dlat_rad = (b[0] - a[0]) * rad_per_deg

        lat1_rad, lon1_rad = list(map(lambda i: i * rad_per_deg, a))
        lat2_rad, lon2_rad = list(map(lambda i: i * rad_per_deg, b))

        a = math.sin(dlat_rad / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon_rad / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return rm * c # Delta in meters


    def interpolate(self, speed, nodeA, nodeB) :
        mps = (0.277777777777778 * speed) # meters per second

        previous = [float(nodeA.lat), float(nodeA.lon)]
        coords = [float(nodeB.lat), float(nodeB.lon)]
        result = []

        d = self.distance(nodeA, nodeB)

        parts = max([int(d * self.sleep_interval / mps), 1])
        dlat = float((coords[0] - previous[0]) / parts)
        dlon = float((coords[1] - previous[1]) / parts)
        for i in range(parts) :
            result.append(Coords(previous[0] + dlat * (i + 1), previous[1] + dlon * (i + 1)))

        return result



    """docstring for getNextNodeIndex"""
    def getNextNodeIndex(self, way, node, forward=True) :

        if forward :
            next_node_index = way.nodes.index(node) + 1
            if next_node_index >= len(way.nodes) :
                if (len(way.nodes) > 1) :
                    logger.debug('Reached end of road: {0}. Turning around'.format(self.getPrettyName(way)), self)
                    self.direction_forward = False
                    next_node_index = self.getNextNodeIndex(way, node, self.direction_forward)
                else :
                    next_node_index = 0
        else :
            next_node_index = way.nodes.index(node) - 1
            if next_node_index < 0 :
                if (len(way.nodes) > 1) :
                    logger.debug('Reached end of road {0}. Turning around'.format(self.getPrettyName(way)), self)
                    self.direction_forward = True
                    next_node_index = self.getNextNodeIndex(way, node, self.direction_forward)
                else :
                    next_node_index = len(way.nodes) - 1
        return next_node_index



    """docstring for getPrettyName"""
    def getPrettyName(self, element) :
        if 'name' in element.tags :
            return element.tags['name'].encode('utf-8')
        else :
            return element.id



    """determine the next section of the way"""
    def getNextSection(self, current_way, current_node) :

        # determine the next node
        turn = False

        # check whether current node belongs to more than one way
        if (len(self.nodes[current_node.id].ways) > 1) :
            # randomly choose next way
            next_way = random.choice(self.nodes[current_node.id].ways)
            if next_way != current_way :
                # junction encountered -> randomly choose next way
                current_way = next_way
                logger.debug('Turning on road {0}'.format(self.getPrettyName(next_way)), self)
                turn = True

        next_node_index = self.getNextNodeIndex(current_way, current_node, self.direction_forward)
        current_node = current_way.nodes[next_node_index]

        return (current_way, current_node)



    """ broadcast current location """
    def broadcastLocation(self) :

        # enqueue data to be published
        self.publisherQueue.put(('location', self.current_coords))

        logger.debug('Current way: {0} ({5}), Current node: {1} ({2}, {3}) ({4} coords left)'.format(
                self.getPrettyName(self.current_way),
                self.getPrettyName(self.current_node),
                self.current_coords.lat,
                self.current_coords.lon,
                len(self.current_coords_list),
                self.current_way.tags['highway']), self)



    """ broadcast obd """
    def broadcastObd(self) :

        obd = [
            ('Engine Coolant Temperature', '{0}C'.format(random.randint(80, 90))),
            ('Vehicle Speed', '{0}km/h'.format(random.randint(self.speed - 5, self.speed + 5))),
            ('Engine RPM', '{0} RPM'.format(random.randint(1500, 2500)))
        ]

        # enqueue data to be published
        self.publisherQueue.put(('obd', obd[0]))
        self.publisherQueue.put(('obd', obd[1]))
        self.publisherQueue.put(('obd', obd[2]))


    """ tick """
    def tick(self) :

        self.broadcastLocation()
        self.broadcastObd()

        if len(self.current_coords_list) > 0 :
            self.current_coords = self.current_coords_list.pop(0)
        else :
            # store the next section as current
            self.current_node = self.next_node

            # get the next section
            self.next_way, self.next_node = self.getNextSection(self.next_way, self.next_node)
            self.current_way = self.next_way
            self.current_coords_list = self.interpolate(self.speed, self.current_node, self.next_node)
            logger.debug('Interpolated {0} coords in the next section'.format(len(self.current_coords_list)), self)



    """start"""
    def start(self) :

        self.current_way = random.choice(self.result.ways) # randomly get the starting way
        self.current_node = self.current_way.nodes[0] # get the first node of the starting way

        self.next_way, self.next_node = self.getNextSection(self.current_way, self.current_node)
        self.current_coords_list = self.interpolate(self.speed * self.sleep_interval, self.current_node, self.next_node)
        self.current_coords = self.current_coords = self.current_coords_list.pop(0)

        # stay here until parent thread inform us to exit
        while not self.stop_event.is_set() :
            self.tick()
            time.sleep(self.sleep_interval)

        self.publisherQueue.put(('exit', ''))
