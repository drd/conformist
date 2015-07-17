import {expect} from 'chai';

import {Type, Validator, Scalar, Int, Str, Bool, Enum, Container, List, Map} from './flat.js';


var MyString = Str.named('string').using({default: 'default', optional: false});
var s = new MyString();
expect(s.name).to.equal('string');
expect(s.default).to.equal('default');
expect(s.optional).to.equal(false);

// lifecycle
expect(s.value).to.equal(null);
expect(s.valid).to.equal(undefined);
expect(s.serialized).to.equal(null);
expect(s.raw).to.equal(null);

s.validate();
expect(s.valid).to.equal(false);

s = MyString.fromDefaults();
expect(s.value).to.equal(s.default);

s.validate();
expect(s.valid).to.equal(true);

expect(s.set(123)).to.equal(true);
expect(s.value).to.equal('123');
expect(s.raw).to.equal(123);
expect(s.serialized).to.equal('123');

s.validate();
expect(s.valid).to.equal(true);


// INTS
let n = new Int();
n.set('yr mom');
expect(n.value).to.equal(null)
n.set('123');
expect(n.value).to.equal(123)


// LISTS
var Strings = List.of(Str);
let ss = new Strings();
ss.set(['yr', 'mom']);
expect(ss.value).to.eql(['yr', 'mom'])

var DefaultedStrings = Strings.using({default: ['foo', 'bar']});
let ds = new DefaultedStrings();
expect(ds.value).to.eql([]);
let dds = DefaultedStrings.fromDefaults();
expect(dds.value).to.eql(dds.default);


// MAPS
let ABMap = Map.of(Str.named('a'), Int.named('b'));
let abMap = new ABMap();
abMap.set({a: 'foo', b: 3})
expect(abMap.value.a).to.equal('foo');
expect(abMap.value.b).to.equal(3);


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
expect(pos.valid).to.equal(true);
pos.set(-3);
pos.validate();
expect(pos.valid).to.equal(false);
expect(pos.errors[0]).to.equal(pos.validators[0].nonPositive);


class ConfirmationMatch extends Validator {
  mustMatch = 'Password and confirmation do not match'

  validate(element, state) {
    if (element.members['pass'].value !== element.members['conf'].value) {
      return this.noteError(element, state, {key: 'mustMatch'});
    }
    return true;
  }
}

let PasswordConfirmation = Map.of(Str.named('pass'), Str.named('conf')).validatedBy(new ConfirmationMatch())
let pc = new PasswordConfirmation();
pc.set({pass: '12345', conf: '12346'});
expect(pc.validate()).to.equal(false);
expect(pc.errors[0]).to.equal(pc.validators[0].mustMatch);


let Yadda = Map.of(
  Str.named('a').validatedBy(x => {
    if (!!x) {
      x.addError('Truthy');
      return false;
    }
    return true;
  }),
  Str.named('b').validatedBy(x => {
    if (x.value !== '3') {
      x.addError('Not 3');
      return false;
    }
    return true;
  })
);
let yadda = new Yadda();
yadda.set({a: true, b: 2});
yadda.validate();
expect(yadda.allErrors).to.eql({a: ['Truthy'], b: ['Not 3']});

// ENUMS
let Fruit = Enum.of(Str).valued(['Apple', 'Banana', 'Carambola', 'Dragonfruit']);
let fruit = new Fruit();
expect(fruit.set('Spinach')).to.equal(false);
expect(fruit.value).to.equal(null);
expect(fruit.set('Banana')).to.equal(true);
expect(fruit.value).to.equal('Banana');

let Prime = Enum.of(Int).valued([2, 3, 5, 7, 11, 13, 17]);
let prime = new Prime();
expect(prime.set(1)).to.equal(false);
expect(prime.set(3)).to.equal(true);
expect(prime.value).to.equal(3);


// BOOLS
let George = Bool.using({default: false});
let george = George.fromDefaults();
expect(george.value).to.equal(false);
george.set(undefined);
expect(george.value).to.equal(false);
george.set('');
expect(george.value).to.equal(false);
george.set(true);
expect(george.value).to.equal(true);
george.set('hi');
expect(george.value).to.equal(true);
george.set([1, 2, 3]);
expect(george.value).to.equal(true);
