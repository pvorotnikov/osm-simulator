(function() {

    'use strict';

    /* =========================================
     * Require configuration
     * =========================================
     */
    require.config({
        baseUrl: './js/',
        paths: {
            'cordova': '../cordova',
            'config': '../config',
            'react': '../lib/react/react',
            'react-dom': '../lib/react/react-dom',
            'classnames': '../lib/classnames/classnames',
            'moment': '../lib/moment/moment',
            'jquery': '../lib/jquery/jquery',
            'onsenui': '../lib/onsenui/js/onsenui',
            'react-onsenui': '../lib/react-onsenui/react-onsenui',
            'fontawesome': '../lib/font-awesome/css/font-awesome',
        },
        shim: {
            'jquery': {
                exports: 'jQuery'
            }
        }
    });


    /* =========================================
     * Application entry point
     * =========================================
     */

    require(['cordova', 'index'], function(Cordova, Index) {

        const index = new Index();

    });

})();
