import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import cssModules from 'hoc/cssModules';
import Svg from 'components/Svg';
import styles from './User.module.styl';

function User({ data, selected, onClick, onDelete }) {
    const styleNames = cn('User', { User_selected: selected });
    const avatarBg = { backgroundImage: `url(${data.avatar})` };

    return (
        <div styleName={styleNames}>
            <div styleName="User__avatar" onClick={onClick} style={avatarBg} />
            <div styleName="User__delete" onClick={onDelete}>
                <Svg name="delete" />
            </div>
        </div>
    );
}

User.propTypes = {
    selected: PropTypes.bool,
    onClick: PropTypes.func,
    onDelete: PropTypes.func,
    data: PropTypes.shape({
        // username: PropTypes.string.isRequired,
        // personaname: PropTypes.string,
        // profileurl: PropTypes.string,
        avatar: PropTypes.string
    })
};

export default cssModules(styles)(User);
