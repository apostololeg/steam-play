import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import cssModules from 'hoc/cssModules';
import SearchInput from 'components/SearchInput';
import Svg from 'components/Svg';
import styles from './Game.module.styl';

function Game({ data, selected, onClick }) {
    const { appid, name, icon } = data; // img_logo_url
    const appUrl = `https://store.steampowered.com/app/${appid}`;
    const iconUrl = `http://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${icon}.jpg`;
    const iconStyle = {
        backgroundImage: `url(${iconUrl})`
    };
    const styleNames = cn('Game', { Game_selected: selected });

    return <div styleName={styleNames} onClick={onClick}>
        <div styleName="Game__icon" style={iconStyle} />
        <div styleName="Game__description">
            <div styleName="Game__title">{name}</div>
            <a styleName="Game__link"
                href={appUrl}
                target="_blank"
                title="Open on Steam (new tab)">
                <Svg name="external-link" height={24} width={24} />
            </a>
        </div>
    </div>;
}

Game.propTypes = {
    selected: PropTypes.bool,
    onClick: PropTypes.func,
    data: PropTypes.shape({
        appid: PropTypes.number,
        name: PropTypes.string,
        img_icon_url: PropTypes.string
    })
};

export default cssModules(styles)(Game);
