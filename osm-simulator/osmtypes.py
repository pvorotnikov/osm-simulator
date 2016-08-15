from collections import namedtuple

# Create custom types
Node = namedtuple('Node', ['id', 'lat', 'lon', 'ways'])
Way = namedtuple('Way', ['id', 'nodes'])
