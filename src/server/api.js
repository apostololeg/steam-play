import axios from 'axios';

function stringify(params = {}) {
    const str = Object.keys(params).reduce(
        (acc, key) => `${acc}&${key}=${params[key]}`,
        ''
    );

    return str.replace(/^\&/, '?');
}

function formatUrl(url, scheme) {
    const urlParams = url.match(/{(\w+)}/g); // match {params}

    if (urlParams) {
        return urlParams.reduce(
            (acc, param) => {
                const paramName = param.replace(/({|})/g, '');

                return acc.replace(param, scheme[paramName]);
            },
            url
        );
    }

    return url;
}

class API {
    constructor(opts) {
        this.opts = opts;
    }

    async get(api, reqParams) {
        const {
            url,
            scheme,
            defaultReqParams } = this.opts;
        const currScheme = scheme[api];
        const {
            service,
            method,
            params } = currScheme;

        const schemeParams = typeof params === 'function'
            ? params(reqParams)
            : params;
        const paramsStr = stringify({
            ...defaultReqParams,
            ...reqParams,
            ...schemeParams
        });
        const reqPath = formatUrl(url, currScheme);

        const defaultFormat = res => res;
        const apiFormatRes = this.opts.formatRes || defaultFormat;
        const schemeFormatRes = currScheme.formatRes || defaultFormat;
        const formatRes = res => schemeFormatRes(apiFormatRes(res));

        console.log(`API.get() :: ${reqPath}${paramsStr}`);

        return axios.get(`${reqPath}${paramsStr}`)
            .then(res => ({ data: formatRes(res) }))
            .catch(error => ({ error }))
    }
}

export default {
    Steam: new API({
        url: 'http://api.steampowered.com/{service}/{method}/v0001/',
        defaultReqParams: {
            format: 'json',
            key: '8738270D3B5D8959A13E1BC255D5702A'
        },
        scheme: {
            userId: {
                service: 'ISteamUser',
                method: 'ResolveVanityURL',
                params: ({ username }) => ({ vanityurl: username }),
                formatRes: ({ data }) => data
            },
            userData: {
                service: 'ISteamUser',
                method: 'GetPlayerSummaries',
                formatRes: ({ data }) => data.players.player[0]
            },
            ownGames: {
                service: 'IPlayerService',
                method: 'GetOwnedGames',
                params: { include_appinfo: 1 },
                formatRes: ({ data }) => data.games
            }
        },
        formatRes: function({ data }) {
            const { response } = data;

            if (response) {
                const { success } = response;

                if (success && success !== 1) {
                    return { error: response };
                }

                return { data: response };
            }

            return { data };
        }
    }),
    Spy: new API({
        url: 'http://steamspy.com/api.php',
        scheme: {
            multiplayerGames: {
                params: {
                    request: 'tag',
                    tag: 'Multiplayer'
                },
                formatRes: ({ data }) => data
            }
        }
    })
};
