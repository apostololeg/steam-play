import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import axios from 'axios';

import cssModules from 'hoc/cssModules';
import SearchInput from 'components/SearchInput';
import Svg from 'components/Svg';
import Spinner from 'components/Spinner';
import styles from './Game.module.styl';

const loadLS = field => JSON.parse(localStorage.getItem(field));
const saveLS = (field, data) =>
    localStorage.setItem(field, JSON.stringify(data));

const CACHE = Object(loadLS('games'));

@cssModules(styles)
class Game extends Component {
    static propTypes = {
        appid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        selected: PropTypes.bool,
        onClick: PropTypes.func
    };

    constructor(props) {
        super(props);

        const { icon, name } = props;

        this.state = { icon, name };

        if (!name || !icon) {
            this.loadData();
        }
    }

    loadData() {
        const { appid } = this.props;

        axios.get(`/game/${appid}`)
            .then(({ error, data }) => {
                if (error) {
                    this.setState({ error });
                    return;
                }

                const { icon, name } = data;

                CACHE[appid] = data;
                this.setState({ icon, name });
                saveLS('games', CACHE);
            })
            .catch(error => {
                this.setState({ error });
            });
    }

    renderIcon() {
        const { appid } = this.props;
        const { icon } = this.state;

        if (!icon) {
            return <div styleName="Game__icon">
                <Spinner />
            </div>;
        }

        const iconUrl = `http://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${icon}.jpg`;
        const iconStyle = {
            backgroundImage: `url(${iconUrl})`
        };

        return <div styleName="Game__icon" style={iconStyle} />;
    }

    render() {
        const { appid, selected, onClick } = this.props;
        const { name } = this.state;
        const styleNames = cn('Game', { Game_selected: selected });
        const linkProps = {
            target: '_blank',
            title: 'Open on Steam (new tab)'
        };

        if (appid) {
            linkProps.href = `https://store.steampowered.com/app/${appid}`;
        }

        return <div styleName={styleNames} onClick={onClick}>
            {this.renderIcon()}
            <div styleName="Game__description">
                <div styleName="Game__title">{name}</div>
                <a styleName="Game__link" {...linkProps}>
                    <Svg name="external-link" height={24} width={24} />
                </a>
            </div>
        </div>;
    }
}

export default Game;
