import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Devices } from '../api/devices';
import { Routes } from '../api/routes';

import Device from './device.jsx';

// App component - represents the whole app
class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            error: null
        }
    }

    _addDevice(e) {
        e.preventDefault();

        // Find the text field via the React ref
        const publicKey = ReactDOM.findDOMNode(this.refs.publicKey).value.trim();
        const privateKey = ReactDOM.findDOMNode(this.refs.privateKey).value.trim();

        let result = Meteor.call('devices.add', publicKey, privateKey, (err, result) => {
            if (err) {
                switch (err.error) {
                    case 400: this.setState({ error: 'Enter correct values' }); break;
                    case 'no-device': this.setState({ error: 'Device not found' }); break;
                    default: this.setState({ error: 'Unknown error: ' + err.error }); break;
                }
            } else {
                this.setState({ error: null });
            }
        });


        // Clear form
        ReactDOM.findDOMNode(this.refs.publicKey).value = '';
        ReactDOM.findDOMNode(this.refs.privateKey).value = '';



    }

    renderDevices() {

        return this.props.devices.map((device) => {
            return <Device
                key={device._id}
                device={device}
                routes={this.props.routes}
                obdii={[]} />
        });
    }

    render() {

        let error = null;
        if (this.state.error) {
            error = <p className='alert alert-warning' role='alert'>{this.state.error}</p>;
        }

        return (
            <div className='app'>
                <div className='add-device'>
                    <form className='form-inline' onSubmit={(e) => this._addDevice(e)}>
                        <input type='text' className='form-control' ref='publicKey' placeholder='Public Key' />
                        &nbsp;
                        <input type='text' className='form-control' ref='privateKey' placeholder='Private Key' />
                        &nbsp;
                        <button type='submit' className='btn btn-default'>Add device</button>
                    </form>
                    {error}
                    <hr />
                </div>
                <div className='table-responsive'>
                    <table className='table table-hover'>
                        <thead>
                            <tr>
                                <th width='50%'>Device name</th>
                                <th width='20%'>Route</th>
                                <th width='20%'>OBDII</th>
                                <th width='10%'></th>
                            </tr>
                        </thead>
                        <tbody>{this.renderDevices()}</tbody>
                    </table>
                </div>
            </div>
        );
    }
}

App.propTypes = {

};

// application data container
// this creates data bindings between models and react properties
export default createContainer(() => {
    Meteor.subscribe('routesPublication');
    Meteor.subscribe('devicesPublication');

    return {
        routes: Routes.find().fetch(),
        devices: Devices.find().fetch(),
    };
}, App);
