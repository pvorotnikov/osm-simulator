define(['react', 'classnames', 'onsenui', 'react-onsenui'], function(React, classNames, ons, OnsUI) {

    'use strict';

    class NavBar extends React.Component {

        render() {

            return (
                <OnsUI.Toolbar>
                    <div className='left'>
                        <OnsUI.ToolbarButton onClick={this.props.onRefresh}>
                            <OnsUI.Icon icon='md-refresh' />
                        </OnsUI.ToolbarButton>
                    </div>
                    <div className='center'>VOpen Administrator</div>
                    <div className='right'>
                        <OnsUI.ToolbarButton onClick={this.props.onAdd}>
                            <OnsUI.Icon icon='md-car' />
                        </OnsUI.ToolbarButton>
                    </div>
                </OnsUI.Toolbar>
            );
        }

    }

    // default properties
    NavBar.defaultProps = {

    };

    // properties validation
    NavBar.propTypes = {
        onRefresh: React.PropTypes.func.isRequired,
        onAdd: React.PropTypes.func.isRequired
    };

    return NavBar;

});
