import {Type, Validator, Scalar, Int, Str, Container, List, Map} from './flat.js';

function expect(thing) {
  return {
    value: thing,
    toBe(value) {
      if (value !== this.value) {
        console.log(`${this.value} was not ${value}`);
        throw new Error(`${this.value} was not ${value}`);
      } else {
        //console.log(`${this.value} is ${value}`);
      }
    },
    toEqual(value) {
      if (! this.value.every((x, i) => value[i] === x)) {
        console.log(`${this.value} did not equal ${value}`);
        throw new Error(`${this.value} did not equal ${value}`);
      }
    }
  }
}

var MyString = Str.named('string').using({default: 'default', optional: false});
var s = new MyString();
expect(s.name).toBe('string');
expect(s.default).toBe('default');
expect(s.optional).toBe(false);

// lifecycle
expect(s.value).toBe(null);
expect(s.valid).toBe(undefined);
expect(s.serialized).toBe(null);
expect(s.raw).toBe(null);

s.validate();
expect(s.valid).toBe(false);

s = MyString.fromDefaults();
expect(s.value).toBe(s.default);

s.validate();
expect(s.valid).toBe(true);

expect(s.set(123)).toBe(true);
expect(s.value).toBe('123');
expect(s.raw).toBe(123);
expect(s.serialized).toBe('123');

s.validate();
expect(s.valid).toBe(true);


// INTS
let n = new Int();
n.set('yr mom');
expect(n.value).toBe(null)
n.set('123');
expect(n.value).toBe(123)


// LISTS
var Strings = List.of(Str);
let ss = new Strings();
ss.set(['yr', 'mom']);
expect(ss.value).toEqual(['yr', 'mom'])

var DefaultedStrings = Strings.using({default: ['foo', 'bar']});
let ds = new DefaultedStrings();
expect(ds.value).toEqual([]);
let dds = DefaultedStrings.fromDefaults();
expect(ds.value).toEqual(DefaultedStrings.defaults);


// MAPS
let ABMap = Map.of(Str.named('a'), Int.named('b'));
let abMap = new ABMap();
abMap.set({a: 'foo', b: 3})
expect(abMap.value.a).toBe('foo');
expect(abMap.value.b).toBe(3);


class IsPositive extends Validator {
  nonPositive = 'Element value must be greater than or equal to zero'

  validate(element, state) {
    if (element.value < 0) {
      return this.noteError(element, state, {key: 'nonPositive'})
    }
    return true;
  }
}

// VALIDATION
class PositiveInt extends Int {
  validators = [new IsPositive()]
}

let pos = new PositiveInt();
pos.set(3);
pos.validate();
expect(pos.valid).toBe(true);
pos.set(-3);
pos.validate();
expect(pos.valid).toBe(false);
expect(pos.errors[0]).toBe(pos.validators[0].nonPositive);


class ConfirmationMatch extends Validator {
  mustMatch = 'Password and confirmation do not match'

  validate(element, state) {
    if (element._members['pass'].value !== element._members['conf'].value) {
      return this.noteError(element, state, {key: 'mustMatch'});
    }
    return true;
  }
}

let PasswordConfirmation = Map.of(Str.named('pass'), Str.named('conf')).validatedBy(new ConfirmationMatch())
let pc = new PasswordConfirmation();
pc.set({pass: '12345', conf: '12346'});
expect(pc.validate()).toBe(false);
expect(pc.errors[0]).toBe(pc.validators[0].mustMatch);
