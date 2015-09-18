# conformist

A [flatland](http://discorporate.us/projects/flatland/)-inspired schema definition and validation library for javascript.


## Types

conformist ships with the following built-in type hierarchy:

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
 +
 |
 Int (TODO: Float)
```

Only the leaf nodes are concrete.

### Scalars

Scalars are single-valued types.

Str is a string.

Bool is a boolean.

Int is an integer.

Enum is an enumerated set of Scalars: `Enum.of(Str).valued(['a', 'b', 'c'])`.

### Containers

Containers have multiple children.

List represents an array.

Map represents an object.


## Schema

You compose types into schema. For example, if you want a number and a checkbox to enforce that the number is odd:

```js
let NumberOddity = Map.of(
    Int.named('number'),
    Bool.named('mustBeOdd').using({optional: true})
).validatedBy(x => x.members().mustBeOdd.value()
    ? x.members().number % 2 == 1
    : true)
```

### Class cloning

Each `Schema` type has several class-cloning static methods on it. Ultimately, each of these calls `Schema.clone` in order to return a new, composed class with a modified prototype. These are:

#### Schema.named(name)

This assigns a name to the element

#### Schema.validatedBy(...validators)

This assigns 1 or more validators to the element.

#### Schema.using(overrides)

This assigns any number of overrides to the new prototype.

`Schema.using({name})` is equivalent to `Schema.named(name)`.


## Elements

Elements are just instances of Schema types. `let element = new Schema()`. Elements have a few useful properties. Consider:

```js
let element = new Str();
element.value()
// undefined
element.set(3)
// true
element.value()
// '3'
element.raw
// 3
```


## Validators

Validators are functions. The idiomatic definition of a validator is a function that takes a validation message and returns a validation function from (element, context) to success. If the validation fails, the error message should be added to the element's errors.

```js
function MustBeOdd(msg) {
    return (element, context) => {
        if (element.members().mustBeOdd.value()) {
            if (!(element.members().number.value() % 2)) {
                element.addError(msg);
                return false;
            }
        }
        return true;
    }
}

let NumberOddity = Map.of(
    Int.named('number'),
    Bool.named('mustBeOdd').using({optional: true})
).validatedBy(MustBeOdd);

let no = new NumberOddity();
no.set({number: 2, mustBeOdd: true});
// true
no.validate();
// false
no.errors
// ['You should enter an odd number']
no.allErrors()
// {self: ['You should enter an odd number'], children: [number: [], mustBeOdd: []]}
```

Each element in a schema contains a list of `errors`, which starts out as `undefined`, but after validation is an array. Elements also have an `allErrors()` method, which for `Scalar` elements is simply returns the `errors` property, but for `Container`s it will include errors for all children as well. For a `List`, `allErrors()` returns a list of lists. For a `Map`, the errors are returned in the format:

```js
{
    self: this.errors,
    children: {
        child1: this.members().child1.allErrors(),
        child2: this.members().child2.allErrors(),
        ...
    }
}
```

## TODO

- drastically improve the quality of this README.
- organize code into separate files
- organize tests into suites
- make a decision about how to integrate with [immutable](https://github.com/facebook/immutable-js)
- should `optional` be a thing, or should there be a Required Validator?
-- how to get useful "this element is required" messages, essentially.

## Contributing

Please fork and send pull requests. If you add a feature, add a test. If you fix a bug, add a test. Thanks!

## Authors

- Eric O'Connell <eric@compassing.net>

## License

See LICENSE.
