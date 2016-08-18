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

            case 'location':

                if (!this.props.location) {
                    return;
                }

                // create coordinates
                var coordinates = new google.maps.LatLng(this.props.location.lat, this.props.location.lon);

                // create or update marker
                if (!this._locationMarker) {
                    this._locationMarker = new google.maps.Marker({position: coordinates, map: this._map, title: 'Location'});
                } else {
                    this._locationMarker.setPosition(coordinates);
                }
                break;

            case 'parkingPosition':

                if (!this.props.parkingPosition) {
                    return;
                }

                // create coordinates
                var coordinates = new google.maps.LatLng(this.props.parkingPosition.lat, this.props.parkingPosition.lon);

                // create or update marker
                if (!this._parkingPositionMarker) {
                    this._parkingPositionMarker = new google.maps.Marker({position: coordinates, map: this._map, title: 'Parking position'});
                } else {
                    this._parkingPositionMarker.setPosition(coordinates);
                }
                break;
        }
    },

    _updatePath: function() {

        // assert map
        if (!this._map) {
            return;
        }

        // assert path
        if (!this.props.path) {
            return;
        }

        // remove any existing polylines and markers
        this._pathPolylines.forEach((entry) => {
            entry.polyline.setMap(null);
            entry.start.setMap(null);
            entry.end.setMap(null);
        });

        this._pathPolylines = [];

        let iconBase = 'http://maps.google.com/mapfiles/kml/shapes/';

        let polylineConfig = {
            path: [],
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2,
            title: '',
            map: this._map
        };

        let startMarkerConfig = {
            position: null,
            title: 'Start',
            animation: google.maps.Animation.DROP,
            icon: iconBase + 'flag_maps.png',
            map: this._map
        };

        let endMarkerConfig = {
            position: null,
            title: 'End',
            animation: google.maps.Animation.DROP,
            icon: iconBase + 'parking_lot_maps.png',
            map: this._map
        };

        // draw separate paths and start/finish markers
        this.props.path.forEach((path) => {

            let startTime = moment(path[0].time).format('YYYY-MM-DD HH:mm');
            let endTime = moment(path[path.length-1].time).format('YYYY-MM-DD HH:mm');

            let coordinates = path.map((entry) => {
                return { lat: entry.lat, lng: entry.lon };
            });
            polylineConfig.path = coordinates;
            startMarkerConfig.position = coordinates[0];
            startMarkerConfig.title = startTime;
            endMarkerConfig.position = coordinates[coordinates.length-1];
            endMarkerConfig.title = endTime;

            let polyline = new google.maps.Polyline(polylineConfig);
            let start = new google.maps.Marker(startMarkerConfig);
            let end = new google.maps.Marker(endMarkerConfig);

            this._pathPolylines.push({
                polyline: polyline,
                start: start,
                end: end
            });
        });

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
        this._parkingPositionMarker = null;
        this._pathPolylines = [];
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
        this._updateMarker('location');
        this._updateMarker('parkingPosition');
        this._updatePath();

        return (
            <div className={"col-md-" + this.props.rows}>
                <div className={classNames('panel', 'panel-default')}>
                    <div className='panel-body'>
                        <div className={classNames('map')} style={{height:this.props.height + 'px'}} ref='map'></div>
                    </div>
                </div>
            </div>
        );
    }
});
