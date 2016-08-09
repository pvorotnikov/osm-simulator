import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Routes = new Mongo.Collection('routes');

if (Meteor.isServer) {

    /* ==============================
     * SERVER DEPENDENCIES
     * ==============================
     */
    const path = Npm.require('path');
    const fs = Npm.require('fs');
    const Fiber = Npm.require('fibers');

    /* ==============================
     * PUBLISH ROUTINE
     * ==============================
     */
    Meteor.publish('routesPublication', function routesPublication() {
        return Routes.find();
    });

    function checkFsRoutes() {

        fs.readdir(path.normalize(Meteor.settings.routesDir), function(err, items) {
            if (err) {
                throw new Meteor.Error(err.message);
            } else {

                // get all stored routes in a Fiber
                new Fiber(() => {

                    let routes = Routes.find().fetch();

                    // delete route if it is not in items
                    // and skip item for every route in items
                    routes.forEach((r) => {
                        let index = items.indexOf(r.filename)
                        if (-1 !== index) {
                            items.splice(index, 1);
                        } else {
                            console.log('Removing obsolete route', r.filename);
                            Routes.remove(r._id);
                        }
                    });

                    // create route for every item not in routes
                    items.forEach((i) => {
                        console.log('Creating route', i);
                        Routes.insert({
                            filename: i,
                            addedAt: new Date()
                        });
                    });

                }).run();

            }
        });
    }

    // check disk for routes
    checkFsRoutes();
    setInterval(checkFsRoutes, Meteor.settings.routesDirCheckInterval);
}
