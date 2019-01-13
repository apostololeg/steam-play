import React, { Component, Fragment } from 'react';
import { bind, debounce } from 'decko';
import axios from 'axios';
import cn from 'classnames';

import getSearchParams from 'tools/getSearchParams';
import cssModules from 'hoc/cssModules';
import SearchInput from 'components/SearchInput';
import Game from 'components/Game';
import User from 'components/User';
import Spinner from 'components/Spinner';
import Svg from 'components/Svg';
import styles from './App.module.styl';

const { debug: DEBUG } = getSearchParams();
const HEAD_HEIGHT = 180;
const PAGE_STEP = DEBUG ? 2 : 10;

function findCommonGames({ users, games }) {
    const usersNames = Object.keys(users);
    const usersList = Object.values(users);
    const gameIds = usersList.reduce((acc, user) => (
        {
            ...acc,
            [user.userName]: Object.keys(user.games)
        }
    ), {});

    const commonGamesData = usersNames.reduce((acc, userName) => {
        if (!gameIds[userName]) {
            debugger
        }

        gameIds[userName].forEach(appid => {
            const isGameCommon = usersNames.every(
                un => {
                    const userGmaesIds = gameIds[un];

                    if (!userGmaesIds) {
                        debugger
                    }

                    return userGmaesIds.indexOf(appid) > -1;
                }
            );

            if (isGameCommon) {
                if (acc[appid]) {
                    acc[appid].count++;
                } else {
                    acc[appid] = { count: 1, userName };
                }
            }
        });

        return acc;
    }, {});

    const commonGames = Object.keys(commonGamesData).reduce((acc, appid) => {
        const { count, userName } = commonGamesData[appid];

        if (count === usersNames.length) {
            acc[appid] = users[userName].games[appid];
        }

        return acc;
    }, {});

    return commonGames;
}

function updateCommonGames(state, data = {}) {
    const { users } = state;
    const usersNames = Object.keys(users);

    const games = usersNames.length === 1
        ? Object(state.users[usersNames[0]].games)
        : findCommonGames(state);
    const maxPlayTime = Object.values(state.games).reduce(
        (acc, game) => Math.max(acc, game.playTime),
        0
    );

    return { games, maxPlayTime };
}

@cssModules(styles)
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // game's ids by userName
            users: {
                // [userName]: {
                //     appid,
                //     playtime_forever,
                //     name,
                //     profileurl,
                //     state,
                //     avatar,
                //     games // same as `games` ↓
                //  },
                //  ...
            },
            // user's common games list
            games: {
                // [appid]: { name, ... },
                // ...
            },
            selectedUser: null,
            selectedGame: null,
            loading: false,
            error: null,
            pageCount: 1,
            maxPlayTime: 0,
            overscrolled: false
        };
    }

    saveUserData(userName, data, moreState) {
        const { users, games } = this.state;
        const state = {
            users: {
                ...users,
                [userName]: {
                    ...users[userName],
                    ...data
                }
            },
            ...moreState
        };

        this.setState({
            ...state,
            ...updateCommonGames({ ...state, games }, data),
            selectedGame: null,
            selectedUser: null,
            pageCount: 1
        });
        // TODO: Save state to LocalStorage!
    }

    @bind
    onRef(el) {
        this.domElem = el;
    }

    @bind
    onScroll(e) {
        const { scrollTop } = this.domElem;
        const { overscrolled } = this.state;

        if (overscrolled) {
            if (scrollTop < HEAD_HEIGHT) {
                this.setState({ overscrolled: false });
            }
        } else {
            if (scrollTop > HEAD_HEIGHT) {
                this.setState({ overscrolled: true });
            }
        }
    }

    @bind
    onSearchInput(value) {
        const { users } = this.state;

        this.setState({ error: null, loading: false });
    }

    @bind
    onFloatSearch() {
        this.domElem.scrollTo(0, 0);
        this.searchField.focus();
    }

    @bind
    async onSearch(username) {
        const userName = username.toLowerCase().trim().replace(/^@/, '');
        const { users, games } = this.state;
        const err = error => this.setState({ error, loading: false });

        if (!userName || users[userName]) {
            console.log('userName', userName, users[userName]);
            return
        }

        await new Promise(resolve => this.setState({ loading: true }, resolve));

        axios.get(`user/${userName}`)
            .then(({ error, data }) => {
                if (error) {
                    err(error);
                    return;
                }

                this.saveUserData(userName, data, { loading: false });
            })
            .catch(({ response, message }) => {
                if (message) {
                    err(message);
                    return;
                }

                const data = Object(response.data);

                err(data.error || data);
            });
    }

    @bind
    onClickMore() {
        this.setState({ pageCount: this.state.pageCount + 1 });
    }

    @bind
    deleteUser(userName) {
        const { users } = this.state;

        delete users[userName];

        this.setState({
            users,
            error: null,
            ...updateCommonGames({ ...this.state, users })
        });
    }

    @bind
    toggleUser(userName) {
        const { selectedUser } = this.state;

        if (selectedUser !== userName) {
            this.setState({ selectedUser: userName });
            return
        }

        this.setState({ selectedUser: null });
    }

    @bind
    toggleGame(appid) {
        const { selectedGame } = this.state;

        if (selectedGame !== appid) {
            this.setState({ selectedGame: appid });
            return
        }

        this.setState({ selectedGame: null });
    }

    getGamesOwnerName() {
        const { users, selectedUser } = this.state;
        const usersData = Object.values(users);
        const s = name => `${name}'s`;

        if (selectedUser) {
            return s(users[selectedUser].personaname);
        }

        if (usersData.length === 1) {
            return s(usersData[0].personaname);
        }

        return 'Common';
    }

    getGamesSubtitle() {
        const { games, users } = this.state;

        const gamesCount = Object.keys(games).length;

        return `${this.getGamesOwnerName()} games – ${gamesCount}`;

    }

    renderSearch() {
        const { loading, error, overscrolled } = this.state;
        const floatClasses = cn(
            styles['App__search-float'],
            overscrolled && styles['App__search-float_visible']
        );

        return <div styleName="App__search">
            <div styleName="App__search-controls">
                <SearchInput
                    placeholder="@username"
                    defaultValue={DEBUG ? "molotoko" : ""}
                    onInput={this.onSearchInput}
                    onSearch={this.onSearch}
                    onRef={el => this.searchField = el}
                />
                {loading && <div styleName="App__spinner">
                    <Spinner  height={50} width={50} />
                </div>}
            </div>
            {error && <div styleName="App__error">{error}</div>}
            <div className={floatClasses}>
                <Svg name="search" onClick={this.onFloatSearch} />
            </div>
        </div>;
    }

    renderUsersList() {
        const { users, selectedUser } = this.state;
        const usersList = Object.values(users);

        if (usersList.length === 0) {
            return null;
        }

        return <Fragment>
            <div styleName="App__subtitle">Team</div>
            <div styleName="App__users">
                {usersList.map(data => {
                    const { userName } = data;

                    return (
                        <div styleName="App__user" key={userName}>
                            <User data={data}
                                selected={selectedUser === userName}
                                onClick={() => this.toggleUser(userName)}
                                onDelete={() => this.deleteUser(userName)}
                            />
                            <div styleName="App__user-playtime" />
                        </div>
                    );
                })}
            </div>
        </Fragment>
    }

    renderGames() {
        const { games, users, pageCount, selectedGame, selectedUser } = this.state;

        if (Object.keys(users).length === 0) {
            return null;
        }

        const gamesList = Object.values(selectedUser ? users[selectedUser].games : games);
        const list = gamesList.slice(0, pageCount * PAGE_STEP);
        const showMore = list.length < gamesList.length;
        const owner = this.getGamesOwnerName();

        return <Fragment>
            <div styleName="App__subtitle">
                {owner} games – {gamesList.length}
            </div>
            <div styleName="App__games">
                {list.length > 0 && list.map(({ appid }) => (
                    <Game
                        appid={appid}
                        selected={selectedGame === appid}
                        onClick={() => this.toggleGame(appid)}
                        key={appid}
                    />
                ))}
                {showMore &&
                    <div styleName="App__more" onClick={this.onClickMore}>
                        more games...
                    </div>
                }
            </div>
        </Fragment>
    }

    render() {
        const { overscrolled } = this.state;
        const usersSectionClasses = cn(
            'App__section_users',
            overscrolled && 'App__section_border-bottom'
        );

        return <div styleName="App" onScroll={this.onScroll} ref={this.onRef}>
            <div>
                <div styleName="App__content">
                    <h1 styleName="App__title">
                        Find games and play together
                    </h1>
                </div>
            </div>
            <div>
                <div styleName="App__content">
                    {this.renderSearch()}
                </div>
            </div>
            <div styleName={usersSectionClasses}>
                <div styleName="App__content">
                    {this.renderUsersList()}
                </div>
            </div>
            <div>
                <div styleName="App__content">
                    {this.renderGames()}
                </div>
            </div>
        </div>;
    }
}

export default App;
