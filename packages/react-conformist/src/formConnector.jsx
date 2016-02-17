import React from 'react';
import Immutable from 'immutable';
import hoistStatics from 'hoist-non-react-statics';
import ImmutablePropTypes from 'react-immutable-proptypes';


export default function formConnector(Form, options = {}) {
    let hoist = options.hoist || [];
    const connecteeToBe = {
        displayName: `FormConnector(${Form.displayName || '[Form]'})`,

        propTypes: Object.assign({},
            Form.propTypes,
            {
                /*
                A conformist schema class (not an instance!) that children will
                not be receiving - we'll be using it locally to generate validation
                messages.
                 */
                schema: React.PropTypes.func.isRequired,
                /*
                A map of the current state of things. Used to init a schema instance
                here, and then passed down to be used by [REDACTED] for [REDACTED].
                 */
                formState: ImmutablePropTypes.map,
                /*

                 */
                formErrors: ImmutablePropTypes.map,
                onChange: React.PropTypes.func.isRequired,
                onSubmit: React.PropTypes.func.isRequired
            }
        ),

        childContextTypes: {
            /* These first two are pass-throughs from above. */
            formState: ImmutablePropTypes.map,
            formErrors: ImmutablePropTypes.map,
            /*
            sets values for fields - takes a path array similar to Immut.getIn()
            args, and essentially just maps them into conformist.
             */
            updateField: React.PropTypes.func,
            /*
            calls props.onChange with a path's value from conformist and a new
            formErrors struct that reflects whatever conformist says about it.
             */
            validateField: React.PropTypes.func,
            /*
            This is used by the RTE to do its custom stuff before we run validation.
            A beforeSubmit hook consists of a path and a getter function; all that
            actually happens before submitting is we run the getter and plug the
            result into the path with updateField.
             */
            beforeSubmit: React.PropTypes.func,
            /*
            This is a handler that wipes out all your beforeSubmit hooks, for when
            widgets such as the RTE do their teardown.
             */
            unregisterBeforeSubmit: React.PropTypes.func,
        },

        getChildContext() {
            return {
                formState: this.props.formState,
                formErrors: this.props.formErrors,
                updateField: this.updateField,
                validateField: this.validateField,
                beforeSubmit: this.beforeSubmit,
                unregisterBeforeSubmit: this.unregisterBeforeSubmit,
            };
        },

        componentWillReceiveProps(nextProps) {
            this._element.set(nextProps.formState);
            this._element.validate();
        },

        componentWillMount() {
            this._element = new this.props.schema();
            this._element.set(this.props.formState);
        },

        componentDidMount() {
            this._beforeSubmitHooks = [];
        },

        componentWillUnmount() {
            this._beforeSubmitHooks = null;
        },

        validateField(path) {
            this.props.onChange(this._element.value, this._validateField(path, this.props.formErrors));
        },

        _validateField(path, formErrors) {
            var conformistPath = path.reduce((newPath, segment) => newPath.concat('children', segment), []);
            var fieldElement = this._element.find(path.join('/'));
            fieldElement.validate();
            return formErrors.setIn(conformistPath, Immutable.fromJS(fieldElement.allErrors));
        },

        updateField(path, value) {
            this._element.find(path.join('/')).set(value);
            this.props.onChange(this._element.value, this.mergeErrors());
        },

        mergeErrors() {
            return this.props.formErrors.mergeDeep(this._element.allErrors);
        },

        onSubmit(evt) {
            let formErrors = this.props.formErrors;
            this._beforeSubmitHooks && this._beforeSubmitHooks.forEach(([path, getter]) => {
                this.updateField(path, getter());
                formErrors = this._validateField(path, formErrors);
            });
            this.props.onSubmit(evt, this._element.value, formErrors);
        },

        beforeSubmit(path, getter) {
            this._beforeSubmitHooks.push([path, getter]);
        },

        unregisterBeforeSubmit(getter) {
            this._beforeSubmitHooks = this._beforeSubmitHooks.filter(
                ([path, oldGetter]) => oldGetter !== getter
            );
        },

        render() {
            let {onSubmit, onChange, ...otherProps} = this.props;
            return <Form {...otherProps} onSubmit={this.onSubmit} />;
        }
    };

    hoist.forEach(name => {
        if (typeof Form.prototype[name] !== 'function') {
            throw new Error(`Cannot hoist non-function ${name} from ${Form.displayName || '[Form]'}`);
        }
        connecteeToBe[name] = function(...args) {
            return this[name](...args);
        };
    });

    const connected = React.createClass(connecteeToBe);
    return hoistStatics(connected, Form);
};
