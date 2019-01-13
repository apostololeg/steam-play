import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { bind } from 'decko';
import cn from 'classnames';

import getSearchParams from 'tools/getSearchParams';
import cssModules from 'hoc/cssModules';
import Svg from 'components/Svg';
import styles from './SearchInput.module.styl';

const { debug: DEBUG } = getSearchParams();

@cssModules(styles)
class SearchInput extends Component {
    static propTypes = {
        styleNames: PropTypes.string,
        onRef: PropTypes.func,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        onInput: PropTypes.func,
        onSearch: PropTypes.func
        // ... other <input> props
    }

    constructor(props) {
        super(props);

        const value = props.value || props.defaultValue;

        this.state = {
            value,
            focused: false,
            showButtons: Boolean(value)
        };
    }

    @bind
    onRef(el) {
        const { onRef } = this.props;

        if (this.inputRef || !el) return;

        this.inputRef = el;
        this.inputRef.focus();

        if (onRef) {
            onRef(el);
        }
    }

    @bind
    onFocus() {
        this.setState({ focused: true });
    }

    @bind
    onBlur() {
        this.setState({ focused: false });
    }

    @bind
    onKeyPress(e = window.event) {
        const { onSearch } = this.props;
        const { value } = this.state;
        const keyCode = e.keyCode || e.which;

        if (keyCode === 13) {
            this.onSearch();
        }
    }

    @bind
    onInput(e) {
        const { onInput } = this.props;
        const { value } = e.target;

        this.setState({
            value,
            showButtons: Boolean(value)
        });

        if (onInput) {
            onInput(...arguments);
        }
    }

    @bind
    onSearch() {
        const { onSearch } = this.props;
        const value = '';

        if (onSearch) {
            onSearch(this.state.value);
        }

        this.inputRef.value = value;
        this.setState({
            value,
            showButtons: false
        });
    }

    @bind
    onClear() {
        const { onInput } = this.props;

        this.inputRef.value = '';
        this.inputRef.focus();
        this.setState({ value: '', showButtons: false });

        if (onInput) {
            onInput('');
        }
    }

    render() {
        const { onSearch, onFocus, onBlur, onRef, ...props } = this.props;
        const { showButtons, focused } = this.state;

        const styleNames = cn('SearchInput', {
            SearchInput_focused: focused
        });

        Object.assign(props, {
            onInput: this.onInput,
            onKeyPress: this.onKeyPress,
            onFocus: this.onFocus,
            onBlur: this.onBlur
        });

        return <div styleName={styleNames}>
            <input styleName="SearchInput__input" {...props}
                ref={this.onRef}
                spellCheck="false"
            />
            {showButtons && <Fragment>
                <div styleName="SearchInput__button" title="Cancel">
                    <Svg name="cancel" onClick={this.onClear} />
                </div>
                <div styleName="SearchInput__button" title="Search">
                    <Svg name="search" onClick={this.onSearch} />
                </div>
            </Fragment>}
        </div>
    }
}

export default SearchInput;
