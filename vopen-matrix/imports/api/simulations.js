import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { Devices } from './devices';
import { Routes } from './routes';

if (Meteor.isServer) {

    /* ==============================
     * SERVER DEPENDENCIES
     * ==============================
     */
    const path = Npm.require('path');
    const fs = Npm.require('fs');
    const Fiber = Npm.require('fibers');

    // vopen sdk
    const Sdk = Npm.require('vopen-sdk/dist/meteor');
    const logger = Sdk.Logger('debug', 'simulations');
    const globals = Sdk.Globals;
    // const gpxParse = require('gpx-parse');



    export class Timer {

        constructor(deviceId) {

            this._deviceId = deviceId;
            this._timer = 0;
            this._originalInterval = 1000;
            this._interval = this._originalInterval;
            this._gateway = null;

            console.log('Creating timer for %s', this._deviceId);

            new Fiber(() => {

                /* ====================================
                 * ESTABLISH CONNECTION
                 * ====================================
                 */

                const device = Devices.findOne(this._deviceId);

                this._gateway = Sdk.Gateway({
                    publicKey: device.publicKey,
                    apiKey: device.apiKey
                });

                this._gateway.addEventListener(globals.EVENTS.CONNECT, () => {
                    logger.debug('Gateway connected');
                });

                this._gateway.addEventListener(globals.EVENTS.DISCONNECT, () => {
                    logger.debug('Gateway disconnected');
                });

                this._gateway.addEventListener(globals.EVENTS.ERROR, (err, origError) => {
                    logger.debug('Gateway error', err);
                });

                /* ====================================
                 * ESTABLISH CONNECTION
                 * ====================================
                 */
                this._timer = Meteor.setTimeout(this._onTimeout.bind(this), this._interval);

            }).run();
        }

        _onTimeout() {
            // schedule next tick
            this._timer = Meteor.setTimeout(this._onTimeout.bind(this), this._interval);
            console.log('%s Message...', this._deviceId);
        }

        clear() {

            Meteor.clearTimeout(this._timer);

            console.log('Stopping timer for %s', this._deviceId);
        }

        setSpeed(speed) {
            this._interval = this._originalInterval / speed;
        }

    }

    export default class Simulations {

        constructor() {

            this._routeTimers = {};
            this._obdiiTimers = {};

            Devices.find().observeChanges({
                added: (id, fields) => {
                    this._updateTimers(id, fields);
                },
                changed: (id, fields) => {
                    this._updateTimers(id, fields);
                },
                removed: (id, fields) => {
                    this._removeTimers(id, fields);
                }
            });

        }

        _updateTimers(id, fields) {
            // add/remove route timer
            if (fields.hasOwnProperty('routeRunning')) {
                if (fields.routeRunning && !this._routeTimers.hasOwnProperty(id)) {
                    this._routeTimers[id] = new Timer(id);
                } else if (!fields.routeRunning && this._routeTimers.hasOwnProperty(id)) {
                    this._routeTimers[id].clear();
                    delete this._routeTimers[id];
                }
            }

            // add/remove obdii timer
            if (fields.hasOwnProperty('obdiiRunning')) {
                if (fields.obdiiRunning && !this._obdiiTimers.hasOwnProperty(id)) {
                    this._obdiiTimers[id] = new Timer(id);
                } else if (!fields.obdiiRunning && this._obdiiTimers.hasOwnProperty(id)) {
                    this._obdiiTimers[id].clear();
                    delete this._obdiiTimers[id];
                }
            }

            // update route timer speed
            if (fields.hasOwnProperty('routeSpeed') && this._routeTimers.hasOwnProperty(id)) {
                this._routeTimers[id].setSpeed(fields.routeSpeed);
            }

            // update obdii timer speed
            if (fields.hasOwnProperty('obdiiSpeed') && this._obdiiTimers.hasOwnProperty(id)) {
                this._obdiiTimers[id].setSpeed(fields.obdiiSpeed);
            }
        }

        _removeTimers(id, fields) {
            // remove route timer
            if (this._routeTimers.hasOwnProperty(id)) {
                this._routeTimers[id].clear();
                delete this._routeTimers[id];
            }

            // remove obdii timer
            if (this._obdiiTimers.hasOwnProperty(id)) {
                this._obdiiTimers[id].clear();
                delete this._obdiiTimers[id];
            }
        }

    }
}
