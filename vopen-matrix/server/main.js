import { Meteor } from 'meteor/meteor';

import Devices from '../imports/api/devices';
import Routes from '../imports/api/routes';
import Simulations from '../imports/api/simulations';

Meteor.startup(() => {

    let simulations = new Simulations();

});
