// meteor packages
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { HTTP } from 'meteor/http';
import { check, Match } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import Routes from './routes';

export const Devices = new Mongo.Collection('devices');
Devices.schema = new SimpleSchema({
    name: {type: String},
    publicKey: {type: String},
    apiKey: {type: String},
    route: {type: String, defaultValue: 'none'},
    routeRunning: {type: Boolean, defaultValue: false},
    routeSpeed: {type: Number, decimal: true, min: 1, max: 5, defaultValue: 1},
    obdii: {type: String, defaultValue: 'none'},
    obdiiRunning: {type: Boolean, defaultValue: false},
    obdiiSpeed: {type: Number, decimal: true, min: 1, max: 5, defaultValue: 1},
    createdAt: {type: Date},
});
Devices.attachSchema(Devices.schema);

// non empty string matcher
const NonEmptyString = Match.Where((x) => {
    check(x, String);
    return x.length > 0;
});

if (Meteor.isServer) {

    /* ==============================
     * SERVER DEPENDENCIES
     * ==============================
     */
    const Future = Npm.require('fibers/future');
    const Fiber = Npm.require('fibers');

    /* ==============================
     * PUBLISH ROUTINE
     * ==============================
     */
    Meteor.publish('devicesPublication', function devicesPublication() {
        return Devices.find({}, { fields: {publicKey: 0, apiKey: 0} });
    });

    /* ==============================
     * SERVER METHODS
     * ==============================
     */
    Meteor.methods({


        /* ==============================
         * CRUD
         * ==============================
         */

        /**
         * Add a device.
         * @param {String} publicKey
         * @param {String} apiKey
         */
        'devices.add'(publicKey, apiKey) {
            check(publicKey, NonEmptyString);
            check(apiKey, NonEmptyString);

            // use future to sync-wrap http-request
            let future = new Future();

            // validate keys
            let url = Meteor.settings.apiEndpoint + '/auth/validate';
            HTTP.call('POST', url, {
                    auth: Meteor.settings.apiPublicKey + ':' + Meteor.settings.apiToken,
                    data: { publicKey: publicKey, apiKey: apiKey }
                },
                (err, result) => {
                    if (err) {
                        if (401 === err.response.statusCode) {
                            future.throw(new Meteor.Error('unauthorized'));
                        } else {
                            future.throw(new Meteor.Error('unknown-error'));
                        }
                    } else {
                        if ('ok' === result.data.status) {

                            Devices.insert(Devices.schema.clean({
                                name: '(' + result.data.data.firstName + ' ' + result.data.data.lastName +  ') ' + result.data.data.deviceName,
                                publicKey: result.data.data.id,
                                apiKey: apiKey,
                                createdAt: new Date()
                            }));
                            future.return();
                        } else {
                            future.throw(new Meteor.Error('no-device'));
                        }
                }
            });

            return future.wait();
        },

        /**
         * Remove a device.
         * @param {String} deviceId
         */
        'devices.remove'(deviceId) {
            check(deviceId, NonEmptyString);

            Devices.remove(deviceId);
        },


        /* ==============================
         * ROUTE
         * ==============================
         */

        /**
         * Assign a route to the route simulation.
         * @param {String} deviceId
         * @param {String} routeId
         */
        'devices.setRoute'(deviceId, routeId) {
            check(deviceId, NonEmptyString);
            check(routeId, NonEmptyString);

            if ('none' === routeId) {
                Devices.update(deviceId, { $set: { route: 'none', routeRunning: false } });
            } else {
                Devices.update(deviceId, { $set: { route: routeId } });
            }
        },

        /**
         * Increase the route simulation speed.
         * @param {String} deviceId
         */
        'devices.increaseRouteSpeed'(deviceId) {
            check(deviceId, NonEmptyString);
            let device = Devices.findOne(deviceId);
            Devices.update(deviceId, { $set: { routeSpeed: device.routeSpeed + 0.5 } });
        },

        /**
         * Decrease the route simulation speed.
         * @param {String} deviceId
         */
        'devices.decreaseRouteSpeed'(deviceId) {
            check(deviceId, NonEmptyString);
            let device = Devices.findOne(deviceId);
            Devices.update(deviceId, { $set: { routeSpeed: device.routeSpeed - 0.5 } });
        },

        /**
         * Set the route simulation state.
         * @param {String} deviceId
         * @param {Boolean} state
         */
        'devices.setRouteRunning'(deviceId, state) {
            check(deviceId, NonEmptyString);
            check(state, Boolean);
            let device = Devices.findOne(deviceId);

            if ('none' !== device.route) {
                Devices.update(deviceId, { $set: { routeRunning: state } });
            } else {
                Devices.update(deviceId, { $set: { routeRunning: false } });
            }
        },

        /* ==============================
         * OBDII
         * ==============================
         */

        /**
         * Assign an obdii to the obdii simulation.
         * @param {String} deviceId
         * @param {String} obdiiId
         */
        'devices.setObdii'(deviceId, obdiiId) {
            check(deviceId, NonEmptyString);
            check(obdiiId, NonEmptyString);

            if ('none' === obdiiId) {
                Devices.update(deviceId, { $set: { obdii: 'none', obdiiRunning: false } });
            } else {
                Devices.update(deviceId, { $set: { obdii: obdiiId } });
            }
        },

        /**
         * Increase the obdii simulation speed.
         * @param {String} deviceId
         */
        'devices.increaseObdiiSpeed'(deviceId) {
            check(deviceId, NonEmptyString);
            let device = Devices.findOne(deviceId);
            Devices.update(deviceId, { $set: { obdiiSpeed: device.obdiiSpeed + 0.5 } });
        },

        /**
         * Decrease the obdii simulation speed.
         * @param {String} deviceId
         */
        'devices.decreaseObdiiSpeed'(deviceId) {
            check(deviceId, NonEmptyString);
            let device = Devices.findOne(deviceId);
            Devices.update(deviceId, { $set: { obdiiSpeed: device.obdiiSpeed - 0.5 } });
        },

        /**
         * Set the obdii simulation state.
         * @param {String} deviceId
         * @param {Boolean} state
         */
        'devices.setObdiiRunning'(deviceId, state) {
            check(deviceId, NonEmptyString);
            check(state, Boolean);
            let device = Devices.findOne(deviceId);

            if ('none' !== device.obdii) {
                Devices.update(deviceId, { $set: { obdiiRunning: state } });
            } else {
                Devices.update(deviceId, { $set: { obdiiRunning: false } });
            }
        },

    });

}
