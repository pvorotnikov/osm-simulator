define([
    'react',
    'react-dom',
    'classnames',
    'moment',
    'onsenui',
    'react-onsenui',
    'config',
    'components/navbar'], function(React, ReactDOM, classNames, moment, ons, OnsUI, config, NavBar) {

    'use strict';

    class GestureListItem extends React.Component {

        componentDidMount() {
            let item = ReactDOM.findDOMNode(this);
            this._gd = ons.GestureDetector(item);
            this._gd.on('hold', (e) => {
                this.props.onHold();
            });
        }

        render() {
            return (
                <OnsUI.ListItem tappable={true}>
                    <div className='center'>
                        {this.props.label}
                    </div>
                    <div className='right'>
                        <OnsUI.Switch checked={this.props.running} onChange={this.props.onChange} />
                    </div>
                </OnsUI.ListItem>
            );
        }
    }

    GestureListItem.propTypes = {
        label: React.PropTypes.string.isRequired,
        running: React.PropTypes.bool.isRequired,
        onChange: React.PropTypes.func.isRequired,
        onHold: React.PropTypes.func.isRequired
    };

    class MainPage extends React.Component {

        constructor(props) {
            super(props);

            this.state = {
                simulators: []
            }
        }

        componentWillMount() {
            this._fetchSimulators();
        }

        render() {

            return (
                <OnsUI.Page renderToolbar={() => <NavBar onRefresh={() => this._refreshHandler()} onAdd={() => this._addHandler()} />}>
                    <OnsUI.Row>
                        <OnsUI.Col>
                            <OnsUI.List
                                dataSource={this.state.simulators}
                                renderRow={(row, index) => this._renderListRow(row, index)}
                                renderHeader={() => <OnsUI.ListHeader>VOpen Simulators</OnsUI.ListHeader>}
                            />
                        </OnsUI.Col>
                    </OnsUI.Row>
                </OnsUI.Page>
            );
        }

        _renderListRow(row, index) {
            return (
                <GestureListItem key={index}
                    label={row.label}
                    running={row.isRunning}
                    onChange={(change) => this._onRunningChange(row.id, change)}
                    onHold={() => this._onSimulatorHold(row.id, row.label)} />
            );
        }

        /**
         * Fetch the simulators list
         */
        _fetchSimulators() {

            $.ajax({
                url: `${config.api}/simulator`,
                method: 'GET',
                beforeSend: (xhr) => {
                    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(config.publicKey + ":" + config.apiKey));
                }
            })
            .done((result) => {
                let simulators = result.data.map((s) => {
                    return {
                        label: s.firstname + ' ' + s.lastname,
                        id: s.id,
                        isRunning: s.isRunning
                    };
                });
                this.setState({
                    simulators
                });
            })
            .fail((data) => {
                console.error(data);
            });
        }

        /**
         * Simulator running state change handler
         * @param  {Number} id      simulator id
         * @param  {Boolean} change simulator running state
         */
        _onRunningChange(id, change) {

            let isRunning = change.value;
            $.ajax({
                url: `${config.api}/simulator/${id}`,
                method: 'PUT',
                data: { isRunning },
                beforeSend: (xhr) => {
                    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(config.publicKey + ":" + config.apiKey));
                }
            })
            .fail((data) => {
                console.error(data);
            });
        }

        /**
         * Simulator hold handler
         * @param  {Number} id    simulator id
         * @param  {String} label simulator label
         */
        _onSimulatorHold(id, label) {
            ons.notification.confirm(`Are you sure you want to delete <br /><b>${label}</b>?`, {cancelable: true})
            .then((result) => {
                if (1 === result) {
                    return $.ajax({
                        url: `${config.api}/simulator/${id}`,
                        method: 'DELETE',
                        beforeSend: (xhr) => {
                            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(config.publicKey + ":" + config.apiKey));
                        }
                    });
                }
            })
            .then((result) => {
                this._fetchSimulators();
            })
            .catch((err) => {
                // Nothing to do
            });
        }

        /**
         * Simulator add handler
         */
        _addHandler() {
            ons.notification.prompt(' ', {cancelable: true, placeholder:'Simulator name', title: 'Name'})
            .then((result) => {
                result = result.trim();
                if (result) {
                    return $.ajax({
                        url: `${config.api}/simulator`,
                        method: 'POST',
                        data: { name: result },
                        beforeSend: (xhr) => {
                            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(config.publicKey + ":" + config.apiKey));
                        }
                    });
                }
            })
            .then((result) => {
                this._fetchSimulators();
            })
            .catch((err) => {
                // Nothing to do
            });
        }

        /**
         * Screen refresh handler
         */
        _refreshHandler() {
            this._fetchSimulators();
        }
    }

    // default properties
    MainPage.defaultProps = {
    };

    // properties validation
    MainPage.propTypes = {
    };

    return MainPage;

});
