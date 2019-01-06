import fs from 'fs';
import cron from 'cron';
import axios from 'axios';
import CircularJSON from 'circular-json';
import jsonfile from 'jsonfile';
import API from './api';

const RUN_ON_INIT = true;
const CACHE_FILE = './cache/index.json';
let FILE_DATA = {
    users: {},
    games: {}
};

class Cache {
    get(field, filter) {
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

    update(field, data) {
        jsonfile.readFile(CACHE_FILE, (err, fileData) => {
            if (err) throw err;

            const dataStr = CircularJSON.stringify({
                ...fileData,
                [field]: {
                    ...fileData[field],
                    ...data
                }
            });

            FILE_DATA = JSON.parse(dataStr);

            jsonfile.writeFile(CACHE_FILE, fileData,
                err => {
                    if (err) throw err;
                    console.log('CACHE: updated', new Date());
                }
            );
        });
    }
}

(function runJob() {
    const cache = new Cache();
    // update every day in 14:55
    cron.job('55 14 * * *', async () => {
        const res = await API.Spy.get('multiplayerGames');
        const { error, data } = res;

        if (error) {
            console.warn(error);
            return;
        }

        cache.update('games', data);
    }, null, null,  null,  null, RUN_ON_INIT);
})();

export default Cache;
