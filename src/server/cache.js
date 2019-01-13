import fs from 'fs';
import cron from 'cron';
import axios from 'axios';
import CircularJSON from 'circular-json';
import jsonfile from 'jsonfile';
import API from './api';

const RUN_ON_INIT = false;
const CACHE_FILE = './cache/index.json';
let FILE_DATA = {
    users: {},
    games: {}
};

function get(field, filter) {
    const cache = FILE_DATA[field];

    if (filter) {
        const res = Object.keys(cache).reduce((acc, key) => {
            const data = cache[key];
            const match = Object.keys(filter)
                .every(field => filter[field] === data[field]);

            if (match) {
                acc[key] = data;
            }

            return acc;
        }, {});

        return Object.keys(res).length === 0 ? null : res;
    }

    return cache;
}

function update(type, data) {
    // TODO: check memory usage
    // // newData));
    FILE_DATA[type] = JSON.parse(CircularJSON.stringify({
        ...FILE_DATA[type],
        ...data
    }));

    jsonfile.writeFile(CACHE_FILE, FILE_DATA,
        err => {
            if (err) throw err;
            console.log('CACHE: updated', new Date());
        }
    );
}

function updateItem(type, field, data) {
    const cache = FILE_DATA[type];
    const newData = {
        ...cache,
        [field]: {
            ...cache[field],
            ...data
        }
    };

    update(type, newData);
}


// load cache from file
jsonfile.readFile(CACHE_FILE, (err, fileData) => {
    if (err) throw err;
    FILE_DATA = fileData;
});

// plan job to update cache of multiplayer games
(function runJob() {
    // update every day in 14:55
    cron.job('55 14 * * *', async () => {
        const res = await API.Spy.get('multiplayerGames');
        const { error, data } = res;

        if (error) {
            console.warn(error);
            return;
        }

        const newGamesData = {
            ...FILE_DATA.games,
            ...data
        };

        update('games', newGamesData);
    }, null, null,  null,  null, RUN_ON_INIT);
})();

export default { get, update, updateItem };
