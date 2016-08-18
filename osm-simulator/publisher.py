import paho.mqtt.client as mqtt
import logger

class Publisher(object) :

    def __init__(self, client_id, queue):
        super(Publisher, self).__init__()

        logger.info('Creating publisher...')

        self.client_id = client_id.split('-')[-1]

        self.client = mqtt.Client()
        self.client.on_connect = self.onConnect
        self.client.connect("iot.eclipse.org", 1883, 60)

        # loop the client
        self.client.loop_start()
        while True :
            data = queue.get()
            payload = '{0},{1},{2}'.format(self.client_id, data.lat, data.lon)
            self.client.publish('osm-data', payload)

    # The callback for when the client receives a CONNACK response from the server.
    def onConnect(self, client, userdata, flags, rc) :
        self.connected = True
