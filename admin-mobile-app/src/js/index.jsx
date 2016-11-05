define(['react', 'react-dom', 'app', 'config'], function(React, ReactDOM, App, config) {

    'use strict';

    class Index {

        /**
         * Index constructor
         */
        constructor() {

            // private properties
            this._appInstance = null;

            // bind to cordova events
            document.addEventListener('deviceready', () => this._receivedEvent('deviceready'), false);
            document.addEventListener('pause', () => this._receivedEvent('pause'), false);
            document.addEventListener('resume', () => this._receivedEvent('resume'), false);
        }

        /**
         * Main event handler
         * @param  {String} id
         */
        _receivedEvent(id) {

            switch (id) {

                case 'deviceready' :

                    console.log('Deviceready received');

                    // init app and provide interface to the updater
                    try {

                        this._appInstance = ReactDOM.render(<App />, document.getElementById('app'));

                    // catch any errors that may arise on app mounting
                    } catch(err) { console.error(err); }
                    break;

                case 'pause' :
                    console.log('Pause received');
                    break;

                case  'resume' :
                    console.log('Resume received');
                    break;

            }
        }

    }

    return Index;

});
