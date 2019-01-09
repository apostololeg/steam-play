import React, { Component, Fragment } from 'react';
import { bind } from 'decko';
import axios from 'axios';

import getSearchParams from 'tools/getSearchParams';
import cssModules from 'hoc/cssModules';
import SearchInput from 'components/SearchInput';
import Game from 'components/Game';
import User from 'components/User';
import Spinner from 'components/Spinner';
import styles from './App.module.styl';

const { debug: DEBUG } = getSearchParams();
const COL_WIDTH = 200;
const PAGE_STEP = DEBUG ? 2 : 10;

function findCommonGames({ users, games }) {
    const usersNames = Object.keys(users);
    const usersList = Object.values(users);
    const gameIds = usersList.reduce((acc, user) => (
        {
            ...acc,
            [user.username]: Object.keys(user.games)
        }
    ), {});

    const commonGamesData = usersNames.reduce((acc, username) => {
        gameIds[username].forEach(appid => {
            const isGameCommon = usersNames.every(
                un => gameIds[un].indexOf(appid) > -1
            );

            if (isGameCommon) {
                if (acc[appid]) {
                    acc[appid].count++;
                } else {
                    acc[appid] = { count: 1, username };
                }
            }
        });

        return acc;
    }, {});

    const commonGames = Object.keys(commonGamesData).reduce((acc, appid) => {
        const { count, username } = commonGamesData[appid];

        if (count === usersNames.length) {
            acc[appid] = users[username].games[appid];
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
        (acc, game) => Math.max(acc, game.playtime),
        0
    );

    return { games, maxPlayTime };
}

@cssModules(styles)
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // game's ids by username
            users: {
                // [username]: {
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
        };
    }

    saveUserData(username, data, moreState) {
        const { users, games } = this.state;
        const state = {
            users: {
                ...users,
                [username]: {
                    ...users[username],
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
    onSearchInput(value) {
        const { users } = this.state;

        this.setState({ error: null, loading: false });
    }

    @bind
    async onSearch(username) {
        const { users, games } = this.state;
        const err = error => this.setState({ error, loading: false });

        if (!username || users[username]) {
            console.log('username', username, users[username]);
            return
        }

        await new Promise(resolve =>
            this.setState({ loading: true }, resolve)
        );

        axios.get(`user/${username}`)
            .then(({ error, data }) => {
                if (error) {
                    err(error);
                    return;
                }

                this.saveUserData(username, data, { loading: false });
            })
            .catch(({ response, message }) => {
                if (response) {
                    err(Object(response.data).error);
                    return;
                }

                err(message);
                console.error(error);
            });
    }

    @bind
    onClickMore() {
        this.setState({ pageCount: this.state.pageCount + 1 });
    }

    @bind
    deleteUser(username) {
        const { users } = this.state;

        delete users[username];

        this.setState({
            users,
            ...updateCommonGames({ ...this.state, users })
        });
    }

    @bind
    toggleUser(steamid) {
        const { selectedUser } = this.state;

        if (selectedUser !== steamid) {
            this.setState({ selectedUser: steamid });
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

    renderGames() {
        const { games, pageCount, selectedGame } = this.state;
        const gamesList = Object.values(games);
        const list = gamesList.slice(0, pageCount * PAGE_STEP);
        const showMore = list.length < gamesList.length;

        return <div styleName="App__games">
            {list.map(data => {
                const { appid } = data;

                return <Game styleName="App__game"
                    data={data}
                    selected={selectedGame === appid}
                    onClick={() => this.toggleGame(appid)}
                    key={appid}
                 />;
            })}
            {showMore &&
                <div styleName="App__more" onClick={this.onClickMore}>
                    more games...
                </div>}
        </div>
    }

    render() {
        const {
            loading,
            error,
            users,
            games,
            maxPlayTime,
            selectedUser } = this.state;
        const gamesCount = Object.keys(games).length;

        return <div styleName="App">
            <h1 styleName="App__title">Find games and play together</h1>

            <div styleName="App__header">
                <div styleName="App__search">
                    <SearchInput
                        placeholder="@username"
                        defaultValue={DEBUG ? "molotoko" : ""}
                        onInput={this.onSearchInput}
                        onSearch={this.onSearch}
                    />
                    {loading && <Spinner styleName="App__spinner"
                        height={50}
                        width={50}
                    />}
                    {error && <div styleName="App__error">{error}</div>}
                </div>
                <div styleName="App__users">
                    {Object.values(users).map(data => {
                        const { steamid, username } = data;

                        return (
                            <div styleName="App__user" key={username}>
                                <User data={data}
                                    selected={selectedUser === steamid}
                                    onClick={() => this.toggleUser(steamid)}
                                    onDelete={() => this.deleteUser(username)}
                                />
                                <div styleName="App__user-playtime" />
                            </div>
                        );
                    })}
                </div>
            </div>

            {!!gamesCount && <div styleName="App__games-count">
                Games found – {gamesCount}
            </div>}
            {this.renderGames()}
        </div>;
    }
}

export default App;
