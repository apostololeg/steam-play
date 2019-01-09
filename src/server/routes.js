import API from './api';
import jsonfile from 'jsonfile';
import Cache from './cache';

const CACHE = new Cache();

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
        const { username } = req.params;
        const sendError = msg => res.status(404).send(msg);

        console.log('requiested', `/user/${username}`);

        if (!username) {
            sendError('Please, specify /games/{username}.');
            return;
        }

        const userData = await getUserData(username);

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
            sendError({ error: 'Error request user own games.'});
            return;
        }

        userData.games = ownGames.reduce((acc, game) => {
            const {
                appid,
                playtime_forever: playtime,
                img_icon_url: icon
            } = game;
            const mGame = CACHE.get('games', { appid });

            if (mGame) {
                acc[appid] = { ...mGame[appid], playtime, icon };
            }

            return acc;
        }, {});

        res.status(200).send(userData);
    }
}

export default function Routes(app) {
    Object.keys(ROUTES)
        .forEach(route => app.get(route, ROUTES[route]));
}
