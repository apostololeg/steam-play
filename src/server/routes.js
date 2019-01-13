import API from './api';
import jsonfile from 'jsonfile';
import CACHE from './cache';

async function getUserData(username) {
    // const userCache = CACHE.get('users', { username });

    // if (userCache) {
    //     return userCache;
    // }

    let res;

    const userIdRes = await API.Steam.get('userId', { username });
    const {
        error: userIdErorr,
        data: userIdData } = userIdRes;

    if (userIdErorr || !userIdData) return null;

    const { steamid } = userIdData;
    const userDataRes = await API.Steam.get('userData', { steamids: steamid });
    const {
        error: userDataErorr,
        data: userData } = userDataRes;

    if (userDataErorr) return null;

    const {
        personaname,
        profileurl,
        personastate,
        avatarmedium } = userData;

    const data = {
        steamid,
        personaname,
        profileurl,
        state: personastate,
        avatar: avatarmedium
    };

    if (profileurl) {
        const match = profileurl.match(/\/(\w+)\/$/);

        if (match) {
            data.username = match[1];
        }
    }

    // CACHE.update('users',{ [username]: data });

    return data;
}

const ROUTES = {
    '/user/:username': async function(req, res) {
        const userName = req.params.username.toLowerCase();
        const sendError = error => res.status(404).send({ error });

        console.log('requiested', `/user/${userName}`);

        if (!userName) {
            sendError('Please, specify /games/{userName}.');
            return;
        }

        const userData = await getUserData(userName);

        if (!userData) {
            sendError('Error request user personal data.');
            return;
        }

        const { steamid } = userData;
        const own = await await API.Steam.get('ownGames', { steamid });
        const {
            error: ownGamesErr,
            data: ownGames } = own;

        if (ownGamesErr || !ownGames) {
            sendError('Error request user own games.');
            return;
        }

        delete userData.username;
        userData.userName = userName;
        userData.games = ownGames.reduce((acc, game) => {
            const {
                appid,
                playtime_forever: playTime,
                img_icon_url: icon
            } = game;

            const mGamesRes = CACHE.get('games', { appid });

            if (mGamesRes) {
                const mGame = mGamesRes[appid];

                if (!mGame.icon) {
                    CACHE.updateItem('games', appid, { icon });
                }

                acc[appid] = { appid, playTime };
            }

            return acc;
        }, {});

        res.status(200).send(userData);
    },
    '/game/:appid': (req, res) => {
        const appid = parseInt(req.params.appid);
        const gameData = CACHE.get('games', { appid });

        res.send(gameData[appid]);
    }
}

export default function Routes(app) {
    Object.keys(ROUTES)
        .forEach(route => app.get(route, ROUTES[route]));
}
