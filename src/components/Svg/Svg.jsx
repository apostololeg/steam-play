import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import cssModules from 'hoc/cssModules';
import styles from './Svg.module.styl';

function Svg({ name, styleName, height, width, ...props }) {
    const styles = cn({
        Svg: true,
        [`Svg_name_${name}`]: true,
        Svg_clickable: Boolean(props.onClick),
        [styleName]: Boolean(styleName)
    });

    return <div styleName={styles} {...props}
        style={{
            height, width,
            minHeight: height,
            minWidth: width,
            backgroundImage: `url(/icons/${name}.svg)`
        }}
        shapeRendering="geometricPrecision" />;
}

Svg.propTypes = {
    name: PropTypes.string.isRequired,
    styleName: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Svg.defaultProps = {
    height: 26,
    width: 26
};

export default cssModules(styles)(Svg);
