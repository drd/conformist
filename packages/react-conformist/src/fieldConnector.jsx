'use strict';

import React from 'react';
import Immutable from 'immutable';
import hoistStatics from 'hoist-non-react-statics';


function formStatePath(path) {
    return path.reduce((fsPath, el) => fsPath.concat(['children', el]), []);
}


export default function fieldConnector(Field) {
    const connected = React.createClass({
        displayName: `FieldConnector(${Field.displayName || '[Field]'})`,

        propTypes: Object.assign({},
            Field.propTypes,
            {
                path: React.PropTypes.array, // path in Immutable
                name: React.PropTypes.string.isRequired
            }
        ),

        contextTypes: {
            formState: React.PropTypes.object.isRequired,
            formErrors: React.PropTypes.object.isRequired,
            updateField: React.PropTypes.func.isRequired,
            validateField: React.PropTypes.func.isRequired,
            showErrors: React.PropTypes.bool,
            path: React.PropTypes.array,
            beforeSubmit: React.PropTypes.func,
        },

        childContextTypes: {
            name: React.PropTypes.string,
            value: React.PropTypes.any,
            onChange: React.PropTypes.func.isRequired,
            formState: React.PropTypes.object.isRequired,
            formErrors: React.PropTypes.object.isRequired,
            showErrors: React.PropTypes.bool,
            path: React.PropTypes.array,
            beforeSubmit: React.PropTypes.func,
        },

        showErrors() {
            return this.props.showErrors !== undefined
                ? this.props.showErrors
                : this.context.showErrors;
        },

        getChildContext() {
            return {
                name: this.props.name,
                onChange: this.onChange,
                value: this.formFieldState(),
                formState: this.context.formState,
                formErrors: this.context.formErrors,
                showErrors: this.props.showErrors,
                path: this.path(),
                beforeSubmit: this.beforeSubmit,
            };
        },

        path() {
            return (this.context.path || []).concat(this.props.path || [this.props.name]);
        },

        formFieldState() {
            return this.context.formState.getIn(this.path());
        },

        allErrors() {
            const path = formStatePath(this.path());
            return Immutable.fromJS(this.context.formErrors).getIn(path);
        },

        fieldErrors() {
            const path = formStatePath(this.path()).concat('self');
            return this.context.formErrors.getIn(path);
        },

        // TODO: pass update/validateField down as props so user-defined
        // fields can specify policy?
        // NOTE: You can short-circuit formState updating by passing in an
        // onChange prop to fieldConnected components. You may want to do this
        // in a nested scenario like LocationFallback SubFields
        onChange(v) {
            if (this.props.onChange) {
                this.props.onChange(v);
            } else {
                this.context.updateField(this.path(), v);
                this.context.validateField(this.path());
            }
        },

        beforeSubmit(getter) {
            this.context.beforeSubmit(this.path(), getter);
        },

        render() {
            const { showErrors, ...props } = this.props;
            return <Field {...props}
                          showErrors={this.showErrors()}
                          value={this.formFieldState()}
                          errors={this.fieldErrors()} />;
        }
    });

    return hoistStatics(connected, Field);
};
