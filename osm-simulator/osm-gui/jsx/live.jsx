function Live() {

    'use strict';

    var config = {
        mqttHost: 'iot.eclipse.org/ws',
        mqttPort: 80,
        apiKey: '',
        clientId: 'browser-osm-sim',
    };

    /* ==========================
     * APPLICATION WRAPPER
     * ==========================
     */
    var LiveApp = React.createClass({ displayName: 'LiveApp',

        _onMessage: function(msg) {
            var destinationPath = msg.destinationName.split('/');
            var id = destinationPath[1];
            console.log(destinationPath[2]);
        },

        getInitialState: function() {
            return {
                connected: false,
            };
        },

        componentWillMount: function() {
            // create client
            this._mqttClient = mqttConnector({
                host: config.mqttHost,
                port: config.mqttPort,
                clientId: config.clientId,
                apiKey: config.apiKey,
                sTopics: ['osm-location'],
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
                <div>
                    <div className='content'>
                        <div className={classNames('row', 'text-center')}>
                            { /* <Map rows="12" height="200" title="Map" parkingPosition={this.state.parkingPosition} location={this.state.location} /> */ }
                        </div>
                    </div>
                </div>
            );
        }
    });

    ReactDOM.render(<LiveApp />, document.getElementById('app'));
}
