import {expect} from 'chai';
import sinon from 'sinon';

import {Schema, Validation} from './build/index';
let {Int, Str, Bool, Enum, Map, List} = Schema;
let {Value, Length} = Validation;


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
let spy = sinon.spy();
ss.observe(spy);
ss.set(['yoghurt', 'pops']);
expect(ss.value).to.eql(['yoghurt', 'pops'])
expect(spy.callCount).to.equal(1);
expect(spy.firstCall.args[0]).to.be.true;
expect(spy.firstCall.args[1]).to.equal(ss);

var DefaultedStrings = Strings.using({default: ['foo', 'bar']});
let ds = new DefaultedStrings();
expect(ds.value).to.eql([]);
// on an instance
ds.setDefault();
expect(ds.value).to.eql(ds.default);
// on a class
let dds = DefaultedStrings.fromDefaults();
expect(dds.value).to.eql(dds.default);


// MAPS
let ABMap = Map.of(Str.named('a'), Int.named('b'));
let abMap = new ABMap();
spy = sinon.spy();
abMap.observe(spy);
abMap.set({a: 'foo', b: 3})
expect(abMap.value.a).to.equal('foo');
expect(abMap.value.b).to.equal(3);
expect(spy.callCount).to.equal(1);
expect(spy.firstCall.args[0]).to.be.true;
expect(spy.firstCall.args[1]).to.equal(abMap);
abMap.members.b.set(42);
expect(spy.callCount).to.equal(2);
expect(spy.secondCall.args[0]).to.be.true;
expect(spy.secondCall.args[1]).to.equal(abMap.members.b);
spy.reset();
abMap.set({a: null, b: null});
expect(spy.callCount).to.equal(1);


function IsPositive(msg) {
  return (element, context) => {
    if (element.value < 0) {
      element.addError(msg);
      return false;
    }
    return true;
  }
}

// VALIDATION
class PositiveInt extends Int {
  validators = [IsPositive('You must enter a positive integer')]
}

let pos = new PositiveInt();
pos.set(3);
pos.validate();
expect(pos.valid).to.equal(true);
pos.set(-3);
pos.validate();
expect(pos.valid).to.equal(false);
expect(pos.errors[0]).to.equal('You must enter a positive integer');


let ConfirmationMatch = (msg) => (element, context) => {
  if (element.members['pass'].value !== element.members['conf'].value) {
    element.addError(msg);
    return false;
  }
  return true;
}

let PasswordConfirmation = Map.of(Str.named('pass'), Str.named('conf'))
  .validatedBy(ConfirmationMatch('Password and confirmation do not match'))
let pc = new PasswordConfirmation();
pc.set({pass: '12345', conf: '12346'});
expect(pc.validate()).to.equal(false);
expect(pc.errors[0]).to.equal('Password and confirmation do not match');


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
expect(yadda.allErrors).to.eql({self: [], children: {a: ['Truthy'], b: ['Not 3']}});

let ListOfAtLeastThree = List
  .of(Str
    .named('string')
    .validatedBy(Length.AtLeast('You must enter at least 3 characters', 3)))
  .named('LOALT')
  .validatedBy(Length.AtLeast('You must enter at least 3 strings', 3));
let loalt = new ListOfAtLeastThree();
expect(loalt.set(['ab', 'cd'])).to.be.true;
expect(loalt.validate()).to.be.false;
expect(loalt.allErrors).to.eql({
  self: ['You must enter at least 3 strings'],
  children: [
    ['You must enter at least 3 characters'],
    ['You must enter at least 3 characters']
  ]
});

// OPTION AS A FUNCTION
let Optionally = Map.of(
  Bool.using({name: 'isRequired'}),
  Str.using({name: 'name', optional: x => !x.parent.members.isRequired.value})
);
let optionally = new Optionally();
expect(optionally.members.name.optional(optionally.members.name)).to.be.true;
optionally.set({isRequired: true});
expect(optionally.members.name.optional(optionally.members.name)).to.be.false;



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


// COMPLEX SCHEMA
function fallbackValidator(fallbackValue, message, test = (v) => v) {
  return function (element, state) {
    if (element.parent.members.fallback.value === fallbackValue) {
      if (!test(element.value)) {
        element.addError(message);
        return false;
      }
    }
    return true;
  };
}

let regionCodeValidator = (element, state) => {
  return fallbackValidator(true, 'Please choose a region', (v) => {
    return v.Geo === 'NotApplicable' || v;
  });
}

let optionalIfFallback = el => el.parent.members.fallback.value === true;
let optionalIfAutocomplete = el => el.parent.members.fallback.value === false;

let Location = Map.of(
  Bool.named('fallback').using({default: false}),
  Str.using({optional: optionalIfFallback}).named('location').validatedBy(fallbackValidator(false, 'Please choose a location')),
  Int.using({optional: optionalIfFallback}).named('geoid').validatedBy(fallbackValidator(false, 'Please choose a location')),
  Str.using({optional: optionalIfAutocomplete}).named('city').validatedBy(fallbackValidator(true, 'Please provide a city name')),
  Str.using({optional: optionalIfAutocomplete}).named('regionCode').validatedBy(fallbackValidator(true, 'Please choose a region')),
  Str.using({optional: optionalIfAutocomplete}).named('countryCode').validatedBy(fallbackValidator(true, 'Please choose a country'))
)

let location = new Location();
expect(location.set({fallback: false, location: 'Boston', geoid: 3})).to.eql(true);
expect(location.validate()).to.eql(true);
expect(location.set({fallback: true, city: 'Boston', regionCode: 'US_MA', countryCode: 'US'})).to.eql(true);
expect(location.validate()).to.eql(true);
expect(location.set({fallback: true, city: 'Boston', regionCode: {Geo: 'NotApplicable'}, countryCode: 'US'})).to.eql(true);
expect(location.validate()).to.eql(true);

expect(location.set({fallback: false, location: '', geoid: 3})).to.eql(true);
expect(location.validate()).to.eql(false);
expect(location.allErrors.children.location.length).to.eql(1);
expect(location.allErrors.children.location[0]).to.eql('Please choose a location');
expect(location.set({fallback: false, location: 'Boston'})).to.eql(true);
expect(location.validate()).to.eql(false);
expect(location.set({fallback: true, countryCode: 'US'})).to.eql(true);
expect(location.validate()).to.eql(false);


// ORG SCHEMA
const CAPITALIZED_TYPES = {
    'nonprofit': 'Nonprofit',
    'government': 'Government',
    'socialenterprise': 'SocialEnterprise',
    'recruiter': 'Recruiter',
    'consultant': 'Consultant'
};


let Org = Map.of(
  Enum.of(Str)
    .named('type')
    .valued(Object.keys(CAPITALIZED_TYPES))
    .using({default: 'nonprofit'}),
  List.of(Location)
    .named('addresses')
    .validatedBy(Length.AtLeast('You must enter at least 1 address', 1)),
  Str.named('fullName'),
  Str.named('shortName')
    .validatedBy(Length.AtMost('Short name must be at most 25 characters', 25)),
  Str.named('streetAddress').using({optional: true}),
  Str.named('deliveryDetails').using({optional: true}),
  Str.named('ein').using({optional: true}),
  Str.named('website').using({optional: true}),
  Str.named('description').using({default: ''}),
  List.named('keywords').of(Str).validatedBy(Length.AtLeast('You must choose at least 1 keyword', 1)),
  Str.named('image').using({optional: true})
);

let org = Org.fromDefaults();
expect(org.members.type.value).to.eql('nonprofit');
expect(org.members.description.value).to.eql('');
expect(org.validate()).to.be.false;
expect(org.members.addresses.errors.length).to.eql(1);
expect(org.members.keywords.errors.length).to.eql(1);

org.set({shortName: 'Marx sometimes types really inappropriate test data, but....'});
expect(org.validate()).to.be.false;
expect(org.members.shortName.errors.length).to.eql(1);

org.set({keywords: ['arts', 'hot sauce']});
expect(org.validate()).to.be.false;
expect(org.members.keywords.errors.length).to.eql(0);

let success = org.set({
  type: 'socialenterprise',
  addresses: [{
    location: 'Portlandio',
    geoid: 136777374339,
    fallback: false
  }],
  fullName: 'Conscious Widgets',
  shortName: 'ConWid',
  streetAddress: '12 SW Alder St',
  ein: 'Data dog',
  website: 'https://conwid.net',
  description: 'We produce widgets, responsibly.',
  keywords: ['Socially', 'Conscious', 'Widgets'],
  image: 'http://socially.conscious.jpg.to'
});
expect(success).to.be.true;
expect(org.validate()).to.be.true;
