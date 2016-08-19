'use strict';

var Map = React.createClass({ displayName: 'Map',

    _createCoords: function(lat, lon) {
        return new OpenLayers.LonLat(lon, lat)
                    .transform(
                        new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
                        this._map.getProjectionObject() // to Spherical Mercator Projection
                    );
    },

    _loadMap: function() {

        // initialize map
        this._map = new OpenLayers.Map(this.refs.map);
        this._map.addLayer(new OpenLayers.Layer.OSM());

        // initialize position
        let initialPosition = this._createCoords(this.config.center[0], this.config.center[1]);
        let zoom = 15;

        // Try HTML5 geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                initialPosition = this._createCoords(position.coords.latitude, position.coords.longitude);
            }, () => console.log('Geolocation failed'));
        } else { console.log('Geolocation unsupported') }


        // add markers layer
        this._markersLayer = new OpenLayers.Layer.Markers('Markers');
        this._map.addLayer(this._markersLayer);

        // center map
        this._map.setCenter (initialPosition, zoom);
    },

    _updateMarker: function(type) {
        if (!this._map) {
            return;
        }

        switch (type) {

            case 'device' :
                let device = this.props.device;
                if (!device.hasOwnProperty('id')) return;

                // create coordinates
                let coordinates = this._createCoords(device.lat, device.lon);

                // create new marker
                if (!this._markers.hasOwnProperty(device.id)) {

                    let size = new OpenLayers.Size(7, 7);
                    let offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
                    let icon = new OpenLayers.Icon('https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle_blue.png', size, offset);
                    let m = new OpenLayers.Marker(coordinates, icon);

                    this._markers[device.id] = m;
                    this._markersLayer.addMarker(m);
                    console.log(Object.keys(this._markers).length);
                } else {
                    let newPx = this._map.getLayerPxFromLonLat(coordinates);
                    this._markers[device.id].moveTo(newPx);
                }
                break;
        }
    },

    componentWillMount: function() {
        // define configuration
        this.config = {
            center: [42.66656, 23.370178]
        };

        // define private vars
        this._map = null;
        this._markersLayer = null;
        this._locationMarker = null;

        this._markers = {};
    },

    componentDidMount: function() {
        this._loadMap();
    },

    shouldComponentUpdate : function(nextProps, nextState) {
        return true;
    },

    componentWillUpdate : function(nextProps, nextState) {

    },

    render: function() {

        // update markers
        this._updateMarker('device');

        return (
            <div className={classNames('map')} style={{height:'100%'}} ref='map'></div>
        );
    }
});
