# conformist

A [flatland](http://discorporate.us/projects/flatland/)-inspired validation library for javascript.

## Types

conformist manages to be quite OO, bucking the trend of FP mania. Here's some ASCII art:

```
Type
 |
 +-----------+
 |           |
Scalar      Container
 |           |
 |           +------+
 |           |      |
 |          List   Map
 |
 +-----+------+------+
 |     |      |      |
Num   Str    Bool  Enum
 |
 +------+
 |      |
 Int   (TODO: Float)
```

## Schema

You compose types into schema. For example, if you want a number and a checkbox to enforce that the number is odd:

```js
let NumberOddity = Map.of(
    Int.named('number'),
    Bool.named('mustBeOdd').using({optional: true})
).validatedBy(x => x.members.mustBeOdd.value
    ? x.members.number % 2 == 1
    : true)
```

Contrived? Sure. But it does demonstrate how to make a Map with two fields, one which is optional, and validate the state of the entire dict based on the values of its children.

## Validators

If you want, you can write validators as classes:

```js
class MustBeOdd extends Validator {
    notOdd = "You should enter an odd number"

    validate(element, context) {
        if (element.members.mustBeOdd.value) {
            if (!(element.members.number.value % 2)) {
                this.noteError(element, context, {key: 'notOdd'});
            }
        }
        return true;
    }
}
```

This is the same validator, except now we have a validation message. Fun fact: conformist was written because of validation messages.

What's going on with that `noteError` call? It looks up the message present in the validator's `notOdd` key, and adds the error to the `element`.

```js
let NumberOddity = Map.of(
    Int.named('number'),
    Bool.named('mustBeOdd').using({optional: true})
).validatedBy(new MustBeOdd());

let no = new NumberOddity();
no.set({number: 2, mustBeOdd: true});
// true
no.validate();
// false
no.errors
// ['You should enter an odd number']
no.allErrors
// {self: ['You should enter an odd number'], children: [number: [], mustBeOdd: []]}
```

Each element in a schema contains a list of `errors`, which starts out as `undefined`, but after validation is an array. Elements also have an `allErrors` property, which for `Scalar` elements is identical to the `errors`, but for `Container`s it will include errors for all children as well. For a `List`, `allErrors` returns a list of lists. For a `Map`, the errors are returned in the format:

```js
{
    self: this.errors,
    children: {
        child1: this.members.child1.allErrors,
        child2: this.members.child2.allErrors,
        ...
    }
}
```

## TODO

- organize code into separate files
- organize tests into suites
- integrate i18n with validation messages
- handle string interpolation with error messages ('{name} must be at most {max} characters long')
- make a decision about how to integrate with [immutable](https://github.com/facebook/immutable-js)

## Contributing

Please fork and send pull requests. If you add a feature, add a test. If you fix a bug, add a test. Thanks!

## Authors

- Eric O'Connell <eric@compassing.net>

## License

See LICENSE.
