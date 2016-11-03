import paho.mqtt.client as mqtt
import logger

class Publisher(object) :

    def __init__(self, client_id, queue, publicKey, apiKey):
        super(Publisher, self).__init__()

        logger.info('Creating publisher with public key {0}...'.format(publicKey))

        self.client_id = client_id.split('-')[-1]
        self.apiKey = apiKey
        self.publicKey = publicKey

        self.client = mqtt.Client()
        self.client.username_pw_set(self.apiKey)
        self.client.on_connect = self.onConnect
        self.client.connect("vopen.org", 1883, 60)

        # loop the client
        self.client.loop_start()
        shouldExit = False
        while not shouldExit :

            # wait here unitil parent thread inform us to exit
            action, data = queue.get()
            
            if 'exit' == action :
                shouldExit = True
            
            elif 'obd' == action :
                metric, value = data
                payload = '{0},{1}'.format(metric, value)
                self.client.publish('private/{0}/obd'.format(self.publicKey), payload)
            
            elif 'location' == action :
                payload = '{0},{1},{2},{3}'.format(data.lat, data.lon, 0.0, '00000000')
                self.client.publish('private/{0}/location'.format(self.publicKey), payload)
            
            else : 
                logger.info('Unknown action {0}'.format(action))

        self.client.loop_stop()

    # The callback for when the client receives a CONNACK response from the server.
    def onConnect(self, client, userdata, flags, rc) :
        self.connected = True
