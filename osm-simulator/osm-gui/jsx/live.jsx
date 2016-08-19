function Live() {

    'use strict';

    const config = {
        mqttHost: 'cloud.vopen.org',
        mqttPort: 61614,
        apiKey: '4613f691-4aaf-4568-8e1e-2627cd6dbacf',
        publicKey: 'bcfa308d-548f-4bd8-9395-50078ed77d7d',
        clientId: 'browser-osm-sim',
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
                sTopics: [`private/${config.publicKey}/osm-location`],
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
