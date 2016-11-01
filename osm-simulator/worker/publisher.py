import paho.mqtt.client as mqtt
import logger

class Publisher(object) :

    def __init__(self, client_id, queue):
        super(Publisher, self).__init__()

        logger.info('Creating publisher...')

        self.client_id = client_id.split('-')[-1]
        self.apiKey = '4613f691-4aaf-4568-8e1e-2627cd6dbacf'
        self.publicKey = 'bcfa308d-548f-4bd8-9395-50078ed77d7d'

        self.client = mqtt.Client()
        self.client.username_pw_set(self.apiKey)
        self.client.on_connect = self.onConnect
        self.client.connect("vopen.org", 1883, 60)

        # loop the client
        self.client.loop_start()
        shouldExit = False
        while not shouldExit :
            data = queue.get()
            if data == 'exit' :
                shouldExit = True
            else : 
                payload = '{0},{1},{2}'.format(self.client_id, data.lat, data.lon)
                self.client.publish('private/{0}/osm-location'.format(self.publicKey), payload)

        self.client.loop_stop()

    # The callback for when the client receives a CONNACK response from the server.
    def onConnect(self, client, userdata, flags, rc) :
        self.connected = True
