import random, time, uuid
import logger

class Worker(object) :
    """docstring for Worker"""
    def __init__(self, ways, nodes, raw_result):
        super(Worker, self).__init__()

        self.uuid = uuid.uuid4()
        self.ways = ways
        self.nodes = nodes
        self.result = raw_result
        self.current_way = None
        self.current_node = None
        self.direction_forward = True
        self.sleep_interval = 1

        logger.info('Creating worker...', self)


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



    """docstring for start"""
    def start(self) :
        # choose a random starting way
        self.current_way = random.choice(self.result.ways) # get the starting way
        self.current_node = self.current_way.nodes[0] # get the first node of the starting way

        while True :

            logger.debug('Current way: {0}, Current node: {1} ({2}, {3})'.format(
                self.getPrettyName(self.current_way),
                self.getPrettyName(self.current_node),
                self.current_node.lat,
                self.current_node.lon), self)

            # determine the next node
            turn = False

            # check whether current node belongs to more than one way
            if (len(self.nodes[self.current_node.id].ways) > 1) :
                # randomly choose next way
                next_way = random.choice(self.nodes[self.current_node.id].ways)
                if next_way != self.current_way :
                    # junction encountered -> randomly choose next way
                    self.current_way = next_way
                    logger.debug('Turning on road {0}'.format(self.getPrettyName(next_way)), self)
                    turn = True

            next_node_index = self.getNextNodeIndex(self.current_way, self.current_node, self.direction_forward)
            self.current_node = self.current_way.nodes[next_node_index]

            time.sleep(self.sleep_interval)
