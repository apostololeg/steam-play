import cssModules from 'react-css-modules';

const { NODE_ENV } = process.env;
const isProduction = NODE_ENV === 'production';

function CSSModules(styles) {
    return function withStyles(Component) {
        return cssModules(Component, styles, {
            allowMultiple: true,
            handleNotFoundStyleName: isProduction ? 'ignore' : 'log'
        });
    };
}

export default CSSModules;
