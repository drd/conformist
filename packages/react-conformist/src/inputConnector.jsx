import React from 'react';
import ReactDOM from 'react-dom';
import hoistMethods from './hoisting';


export default function inputConnector(Input, options = {}) {
    const connected = React.createClass({
        displayName: `InputConnector(${Input.displayName || '[Input]'})`,

        contextTypes: {
            name: React.PropTypes.string,
            value: React.PropTypes.any,
            onChange: React.PropTypes.func,
            showErrors: React.PropTypes.bool,
            beforeSubmit: React.PropTypes.func,
            unregisterBeforeSubmit: React.PropTypes.func,
        },

        render() {
            return <Input {...this.props}
                       name={this.context.name}
                       ref="input"
                       value={this.context.value !== undefined ? this.context.value : this.props.value}
                       onChange={this.context.onChange}
                       beforeSubmit={this.context.beforeSubmit}
                       unregisterBeforeSubmit={this.context.unregisterBeforeSubmit}
                       showErrors={this.context.showErrors} />;
        }
    });

    return hoistMethods({
        SourceComponent: Input,
        TargetComponent: connected,
        methods: options.hoist || [],
        refName: 'input',
    });
}
