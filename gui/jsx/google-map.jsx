'use strict';

var Map = React.createClass({ displayName: 'Map',

    _loadMap: function() {
        var originalPosition = new google.maps.LatLng(this.config.center[0], this.config.center[1]);
        var mapOptions = {
            center: { lat: this.config.center[0], lng: this.config.center[1]},
            zoom: 15
        };
        this._map = new google.maps.Map(this.refs.map, mapOptions);

        // Try HTML5 geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                originalPosition = pos;
                this._map.setCenter(pos);
            }.bind(this), function() {
                // Geolocation failed
                this._map.setCenter(originalPosition);
            }.bind(this));
        } else {
            // Browser doesn't support Geolocation
            this._map.setCenter(originalPosition);
        }
    },

    _showInfoWindow: function(marker) {
        this._infoWindow.setContent('Marker');
        this._infoWindow.open(this._map, marker.marker);
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
                let coordinates = new google.maps.LatLng(device.lat, device.lon);

                // create new marker
                if (!this._markers.hasOwnProperty(device.id)) {
                    let image = {
                        url: 'https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle_blue.png',
                        size: new google.maps.Size(7, 7),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(3, 4)
                    };
                    this._markers[device.id] = new google.maps.Marker({
                        position: coordinates,
                        title: 'Location',
                        icon: image,
                        map: this._map
                    });
                } else {
                    this._markers[device.id].setPosition(coordinates);
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
        this._infoWindow = null;
        this._locationMarker = null;

        this._markers = {};
    },

    componentDidMount: function() {
        this._loadMap();
        this._infoWindow = new google.maps.InfoWindow({
            content: ''
        });
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
