function Live() {

    'use strict';

    const config = {
        mqttHost: 'vopen.org',
        mqttPort: 61614,
        apiKey: '<api-key>',
        publicKey: '<public-key>',
        clientId: 'browser-osm-sim-' + new Date().getTime(),
    };

    const update = React.addons.update;

    /* ==========================
     * APPLICATION WRAPPER
     * ==========================
     */
    var LiveApp = React.createClass({ displayName: 'LiveApp',

        _onMessage: function(msg) {
            let parts = msg.payloadString.split(',');
            let id = parts[0];
            let lat = parts[1];
            let lon = parts[2];

            /*
            let updateObj = {};
            updateObj[id] = { lat, lon };
            this.setState({
                devices: update(this.state.devices, { $merge: updateObj })
            });
            */

            this.setState({
                device: {id, lat, lon}
            })
        },

        getInitialState: function() {
            return {
                connected: false,
                devices: {},
                device: {}
            };
        },

        componentWillMount: function() {
            // create client
            this._mqttClient = mqttConnector({
                host: config.mqttHost,
                port: config.mqttPort,
                clientId: config.clientId,
                apiKey: config.apiKey,
                sTopics: [`private/${config.publicKey}/location`],
                onMessage: this._onMessage,
                onConnect: () => this.setState({connected: true}),
                onDisconnect: () => this.setState({connected: false}),
                onFailure: () => this.setState({connected: false})
            });
        },

        componentDidMount: function() {
            this._mqttClient.connect();
        },

        render: function() {
            return (
                <div className='react-root'>
                    <Map rows="12" height="400" title="Map" device={this.state.device} />
                </div>
            );
        }
    });

    ReactDOM.render(<LiveApp />, document.getElementById('app'));
}
