***simple-time-servlet***

This is an example of a TomEE+ web project with one servlet that publish the current UTC time every half second.

The servlet is loaded on startup (see web.xml) and do not support HTTP operations.


------

Sample output from mosquitto client


$ mosquitto_sub  -h 10.185.4.200 -p 1883 -v -d -t currentUTCTime

Received CONNACK

Received SUBACK

Subscribed (mid: 1): 0

Received PUBLISH (d0, q0, r0, m0, 'currentUTCTime', ... (19 bytes))

currentUTCTime 2015-05-24 20:19:49

Received PUBLISH (d0, q0, r0, m0, 'currentUTCTime', ... (19 bytes))

currentUTCTime 2015-05-24 20:19:50

Received PUBLISH (d0, q0, r0, m0, 'currentUTCTime', ... (19 bytes))

currentUTCTime 2015-05-24 20:19:50

Received PUBLISH (d0, q0, r0, m0, 'currentUTCTime', ... (19 bytes))

currentUTCTime 2015-05-24 20:19:51

Received PUBLISH (d0, q0, r0, m0, 'currentUTCTime', ... (19 bytes))

currentUTCTime 2015-05-24 20:19:51

Received PUBLISH (d0, q0, r0, m0, 'currentUTCTime', ... (19 bytes))

------

Giovanni
gvergine@visteon.com