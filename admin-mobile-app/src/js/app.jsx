define(['react', 'react-dom', 'config', 'pages/main'], function(React, ReactDOM, config, MainPage) {

    'use strict';

    class App extends React.Component {

        constructor(props) {
            super(props);

            this.state = {

            };
        }

        render() {
            return (
                <MainPage />
            );
        }
    }

    // default properties
    App.defaultProps = {
    };

    // properties validation
    App.propTypes = {
    };

    return App;

});
