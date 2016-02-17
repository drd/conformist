import React from 'react';
import ReactDOM from 'react-dom';

import schema from '../../conformist-schema/src';
import validation from '../../conformist-validation/src';
import {inputConnector, fieldConnector, formConnector} from '../src';


const Repr = (props) => {
    return <pre>{JSON.stringify(props.value, null, 2)}</pre>;
}


@inputConnector
class ValueInput extends React.Component {
    onChange = (event) => {
        this.props.onChange(event.target.value);
    }

    render() {
        return <input {...this.props} onChange={this.onChange} />
    }
}


@inputConnector
class ValueCheckbox extends React.Component {
    onChange = (event) => {
        this.props.onChange(event.target.checked);
    }

    render() {
        return <input type="checkbox" {...this.props} onChange={this.onChange} />
    }
}


@fieldConnector
class Field extends React.Component {
    static propTypes = {
        label: React.PropTypes.string.isRequired,
    }

    render() {
        const {name, label, showErrors, value, errors} = this.props;
        return <div className="field">
            <label>{label}
                {this.props.children}
                {showErrors && <Repr value={errors}/>}
            </label>
        </div>;
    }
}


@formConnector
class Form extends React.Component {
    render() {
        return <form {...this.props}>
            {this.props.children}
        </form>
    }
}


const NameSchema = schema.Map.of(
    schema.Str.named('first').validatedBy(validation.Length.Between(2, 20, "Don't have a freakishly short or long name")),
    schema.Str.named('last').validatedBy(validation.Value.NonEmpty("You must have a last name, Prince.")),
);


const ComplexSchema = schema.Map.of(
    schema.Str.named('groupName').validatedBy(validation.Length.Between(4, 25, "Please enter a group name between 4 and 25 characters")),
    schema.Bool.named('special'),
    schema.List.named('names').of(NameSchema).validatedBy(validation.Length.Between(1, 10)),
)


class LiveValidation extends React.Component {
    constructor() {
        super();

        const schema = NameSchema.fromDefaults();
        schema.validate();
        this.state = {
            value: schema.value,
            errors: schema.allErrors,
        };
    }

    onChange = (value, errors) => {
        this.setState({value, errors});
    }

    onSubmit = (event, value, errors) => {
        event.preventDefault();
        this.setState({submitted: true});
    }

    render() {
        return <div>
            <h2>Live Validation</h2>

            <Form schema={NameSchema}
                  formState={this.state.value}
                  formErrors={this.state.errors}
                  onChange={this.onChange}
                  onSubmit={this.onSubmit}>
                <Field showErrors={true} name="first" label="First name">
                    <ValueInput />
                </Field>
                <Field showErrors={true} name="last" label="Last name">
                    <ValueInput />
                </Field>

                <button>Submit</button>
            </Form>

            <Repr value={this.state}/>
        </div>;
    }
}


class BlurValidation extends React.Component {
    constructor() {
        super();

        const schema = NameSchema.fromDefaults();
        schema.validate();
        this.state = {
            value: schema.value,
            errors: schema.allErrors,
            blurred: {},
        };
    }

    onChange = (value, errors) => {
        this.setState({value, errors});
    }

    onSubmit = (event, value, errors) => {
        event.preventDefault();
        this.setState({submitted: true});
    }

    onBlur = (fieldName) => (evt) => { this.state.blurred[fieldName] = true; this.setState({blurred: this.state.blurred}) }

    render() {
        return <div>
            <h2>Live Validation</h2>

            <Form schema={NameSchema}
                  formState={this.state.value}
                  formErrors={this.state.errors}
                  onChange={this.onChange}
                  onSubmit={this.onSubmit}>
                <Field name="first" label="First name" showErrors={this.state.blurred['first']}>
                    <ValueInput onBlur={this.onBlur('first')} />
                </Field>
                <Field name="last" label="Last name" showErrors={this.state.blurred['last']}>
                    <ValueInput onBlur={this.onBlur('last')} />
                </Field>

                <button>Submit</button>
            </Form>

            <Repr value={this.state}/>
        </div>;
    }
}

class SubmitValidation extends React.Component {
    constructor() {
        super();

        const schema = NameSchema.fromDefaults();
        schema.validate();
        this.state = {
            value: schema.value,
            errors: schema.allErrors,
            blurred: {},
        };
    }

    onChange = (value, errors) => {
        this.setState({value, errors});
    }

    onSubmit = (event, value, errors) => {
        event.preventDefault();
        this.setState({submitted: true});
    }

    render() {
        return <div>
            <h2>On-Submit Validation</h2>

            <Form schema={NameSchema}
                  formState={this.state.value}
                  formErrors={this.state.errors}
                  onChange={this.onChange}
                  onSubmit={this.onSubmit}>
                <Field name="first" label="First name" showErrors={this.state.submitted}>
                    <ValueInput />
                </Field>
                <Field name="last" label="Last name" showErrors={this.state.submitted}>
                    <ValueInput />
                </Field>

                <button>Submit</button>
            </Form>

            <Repr value={this.state}/>
        </div>;
    }
}


@fieldConnector
class NameField extends React.Component {
    render() {
        return <div>
            <Field name="first" label="First name" showErrors={this.props.showErrors}>
                <ValueInput />
            </Field>
            <Field name="last" label="Last name" showErrors={this.props.showErrors}>
                <ValueInput />
            </Field>
        </div>
    }
}


class ComplexExample extends React.Component {
    constructor() {
        super();

        const schema = ComplexSchema.fromDefaults();
        schema.validate();
        this.state = {
            value: schema.value,
            errors: schema.allErrors,
            blurred: {},
        };
    }

    onChange = (value, errors) => {
        this.setState({value, errors});
    }

    onSubmit = (event, value, errors) => {
        event.preventDefault();
        this.setState({submitted: true});
    }

    addName = (event) => {
        event.preventDefault();
        const element = new ComplexSchema();
        element.set(this.state.value);
        const namesValue = element.members.names.value;
        element.members.names.set(namesValue.concat(NameSchema.fromDefaults()));
        element.validate();
        this.setState({
            value: element.value,
            errors: element.allErrors,
        })
    }

    render() {
        return <div>
            <Form schema={ComplexSchema}
                  formState={this.state.value}
                  formErrors={this.state.errors}
                  onChange={this.onChange}
                  onSubmit={this.onSubmit}>
                <Field name="groupName" label="The name of your group">
                    <ValueInput />
                </Field>
                <Field name="special" label="Is your group special?">
                    <ValueCheckbox />
                </Field>
                <fieldset>
                    <legend>Names in your group</legend>
                    {this.state.value.get('names').map((_, i) => <NameField path={['names', i]}/>)}
                    <button onClick={this.addName}>Add a name</button>
                </fieldset>
                <button>Submit!</button>
            </Form>
            <Repr value={this.state}/>
        </div>;
    }
}


class App extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

    exampleFromHref(href) {
        return href.replace('#', '');
    }

    changeExample = (event) => {
        this.setState({example: this.exampleFromHref(event.target.getAttribute('href'))});
    }

    currentExample() {
        const example = this.state.example || this.exampleFromHref(document.location.hash) || 'live';
        return {
            live: LiveValidation,
            blur: BlurValidation,
            submit: SubmitValidation,
            complex: ComplexExample,
        }[example];
    }

    render() {
        const Example = this.currentExample();

        return <section>
            <h1><code>react-conformist</code> examples</h1>
            <nav>
                <ul>
                    <li><a href="#live" onClick={this.changeExample}>Live Validation</a></li>
                    <li><a href="#blur" onClick={this.changeExample}>On Blur Validation</a></li>
                    <li><a href="#submit" onClick={this.changeExample}>On Submit Validation</a></li>
                    <li><a href="#complex" onClick={this.changeExample}>Complex Schema</a></li>
                </ul>
            </nav>
            <div id="example">
                <Example/>
            </div>
        </section>;
    }
}


ReactDOM.render(<App/>, document.getElementById('root'));
