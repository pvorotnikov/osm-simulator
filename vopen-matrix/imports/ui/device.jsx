import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';

class SimulationEntry extends Component  {

    render() {

        const entryList = this.props.entries.map((e) => {
            return <option key={e._id} value={e._id}>{e.filename}</option>
        });
        entryList.unshift(<option key={this.props.type + '-add-entry'} disabled value='add'>Add entry</option>);
        entryList.unshift(<option key={this.props.type + '-select-entry'} value='none'>Select entry</option>);

        let value;
        switch (this.props.type) {
            case 'route' : value = this.props.device.route; break;
            case 'obdii' : value = this.props.device.obdii; break;
        }

        return (
            <div>
                <select value={value} className='form-control' onChange={(e) => this._onEntrySelect(e)}>
                    {entryList}
                </select>
                <div className='btn-group' role='group'>
                    <button type='button' className='btn btn-default btn-sm' onClick={(e) => this._onSpeedDecrease(e)}><i className="fa fa-backward" aria-hidden="true"></i></button>
                    <button type='button' className='btn btn-default btn-sm' onClick={(e) => this._onToggleRunning(e)}>
                        { this.props.running ? <i className="fa fa-pause" aria-hidden="true"></i> : <i className="fa fa-play" aria-hidden="true"></i> }
                    </button>
                    <button type='button' className='btn btn-default btn-sm' onClick={(e) => this._onSpeedIncrease(e)}><i className="fa fa-forward" aria-hidden="true"></i></button>
                    <button type='button' className='btn btn-default btn-sm disabled'>{this.props.speed}x</button>
                </div>
            </div>
        );

    }

    _onSpeedDecrease(e) {
        switch (this.props.type) {
            case 'route' : Meteor.call('devices.decreaseRouteSpeed', this.props.device._id); break;
            case 'obdii' : Meteor.call('devices.decreaseObdiiSpeed', this.props.device._id); break;
        }

    }

    _onSpeedIncrease(e) {
        switch (this.props.type) {
            case 'route' : Meteor.call('devices.increaseRouteSpeed', this.props.device._id); break;
            case 'obdii' : Meteor.call('devices.increaseObdiiSpeed', this.props.device._id); break;
        }
    }

    _onToggleRunning(e) {
        switch (this.props.type) {
            case 'route' : Meteor.call('devices.setRouteRunning', this.props.device._id, !this.props.running); break;
            case 'obdii' : Meteor.call('devices.setObdiiRunning', this.props.device._id, !this.props.running); break;
        }
    }


    _onEntrySelect(e) {
        if (e.target.value === 'none') {
            switch (this.props.type) {
                case 'route' : Meteor.call('devices.setRoute', this.props.device._id, 'none'); break;
                case 'obdii' : Meteor.call('devices.setObdii', this.props.device._id, 'none'); break;
            }
        } else if (e.target.value === 'add') {
            // TODO: add new entry
        } else {
            switch (this.props.type) {
                case 'route' : Meteor.call('devices.setRoute', this.props.device._id, e.target.value); break;
                case 'obdii' : Meteor.call('devices.setObdii', this.props.device._id, e.target.value); break;
            }
        }
    }
}

SimulationEntry.propTypes = {
    type: PropTypes.string.isRequired,
    entries: PropTypes.array.isRequired,
    speed: PropTypes.number.isRequired,
    device: PropTypes.object.isRequired,
};

// Device component - represents a single device sending messages
export default class Device extends Component {

    render() {

        const deviceClassName = classnames({

        });

        return (
            <tr className={deviceClassName}>
                <td>{this.props.device.name}</td>
                <td><SimulationEntry entries={this.props.routes} type='route' device={this.props.device} speed={this.props.device.routeSpeed} running={this.props.device.routeRunning} /></td>
                <td><SimulationEntry entries={this.props.obdii} type='obdii' device={this.props.device} speed={this.props.device.obdiiSpeed} running={this.props.device.obdiiRunning} /></td>
                <td>
                    <button type='button' className='btn btn-default btn-sm' onClick={(e) => this._onDelete(e)}>
                        <i className="fa fa-trash" aria-hidden="true"></i>
                    </button>
                </td>
            </tr>
        );
    }

    _onDelete(e) {
        Meteor.call('devices.remove', this.props.device._id);
    }

}

Device.propTypes = {
    device: PropTypes.object.isRequired,
    routes: PropTypes.array.isRequired,
    obdii: PropTypes.array.isRequired,
};
