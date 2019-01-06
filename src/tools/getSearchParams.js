export default function() {
    return window.location.search
        .slice(1)
        .split('&')
        .reduce((acc, p) => {
            const [key, val] = p.split('=');

            return {
                ...acc,
                [key]: val
            };
        }, {});
}
