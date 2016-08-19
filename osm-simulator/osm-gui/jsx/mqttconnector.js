'use strict';

function mqttConnector(config) {

    var _config = {
        host: '127.0.0.1',
        port: 1883,
        publicKey: '',
        apiKey: '',
        clientId: new Date().getTime().toString(),
        sTopics: [],
        onConnect: null,
        onDisconnect: null,
        onFailure: null,
        onMessage: null
    };

    // update local config
    for (var i in config)
        if (_config.hasOwnProperty(i))
            _config[i] = config[i];

    var _mqttClient = new Paho.MQTT.Client(_config.host, _config.port, '', _config.clientId);

    // setup connection
    var _setupConnection = function() {
        _mqttClient.onMessageArrived = _onMessage;
        _mqttClient.onConnectionLost = _onConnectionLost;
        _connectToMQTT();
    };

    // connect
    var _connectToMQTT = function() {
        console.log('Connecting with api key: ' + _config.apiKey);
        _mqttClient.connect({
            userName: _config.apiKey,
            password: '',
            onSuccess: _onConnectionSuccess,
            onFailure: _onConnectionFailure
        });
    };

    // on connect
    var _onConnectionSuccess = function(e) {
        console.info('Connection success');

        // subscribe to all topics
        _config.sTopics.forEach(function(t) {
            _mqttClient.subscribe(t);
        });

        // call connect callback
        if (_config.onConnect)
            _config.onConnect(e);
    };

    // on failure
    var _onConnectionFailure = function(e) {
        console.warn('Connection failed', e.errorMessage);
        console.log('Attempting to reconnect');
        setTimeout(_connectToMQTT, 1500);

        // call failure callback
        if (_config.onFailure)
            _config.onFailure(e);
    };

    // on disconnect
    var _onConnectionLost = function(e) {
        console.warn('Connection lost');
        console.log('Attempting to reconnect');
        setTimeout(_connectToMQTT, 1500);

        // call disconnect callback
        if (_config.onDisconnect)
            _config.onDisconnect(e);
    };

    // on message
    var _onMessage = function(msg) {
        // call message callback
        if (_config.onMessage)
            _config.onMessage(msg);
    };

    return {
        connect: _setupConnection
    };

}
