import {default as chai, expect} from 'chai';
import chaiImmutable from 'chai-immutable';
chai.use(chaiImmutable);

import sinon from 'sinon';
import Immutable from 'immutable';

import {Schema, Validation} from './src/conformist';
let {Int, Str, Bool, Enum, Map, List} = Schema;
let {Value, Length} = Validation;


describe('Type', () => {
  it('should set default and name', () => {
    var MyString = Str.named('string').using({default: 'default'});
    var s = new MyString();
    expect(s.name).to.equal('string');
    expect(s.default).to.equal('default');
  })

  it('should set value to undefined', () => {
    var s = new Str();
    expect(s.value).to.be.undefined;
    expect(s.valid).to.equal(undefined);
  })

  it('should validate element without validators to true', () => {
    var s = new Str();
    s.validate();
    expect(s.valid).to.equal(true);
  })

  describe('Scalars', () => {
    describe('Str', () => {
      it('should set default', () => {
        var MyString = Str.using({default: 'hi'});
        var s = MyString.fromDefaults();
        expect(s.value).to.equal(s.default);
        expect(s.value).to.equal('hi');
      })

      it('should coerce to string', () => {
        var s = new Str();
        expect(s.set(123)).to.equal(true);
        expect(s.value).to.equal('123');

        expect(s.set(true)).to.equal(true);
        expect(s.value).to.equal('true');

        expect(s.set(null)).to.equal(false);
        expect(s.value).to.equal(undefined);
      })
    })

    describe('Int', () => {
      it('should accept parseable integers', () => {
        let n = new Int();
        n.set('yoooo');
        expect(n.value).to.equal(undefined)
        n.set('123');
        expect(n.value).to.equal(123)
      })
    })

    describe('Bool', () => {
      it('should coerce to truthiness', () => {
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
      })
    })

    describe('Enum', () => {
      describe('of Str', () => {
        let Fruit = Enum.of(Str).valued(['Apple', 'Banana', 'Carambola', 'Dragonfruit']);
        let fruit = new Fruit();
        expect(fruit.set('Spinach')).to.equal(false);
        expect(fruit.value).to.equal(undefined);
        expect(fruit.set('Banana')).to.equal(true);
        expect(fruit.value).to.equal('Banana');
      })

      describe('of Int', () => {
        let Prime = Enum.of(Int).valued([2, 3, 5, 7, 11, 13, 17]);
        let prime = new Prime();
        expect(prime.set(1)).to.equal(false);
        expect(prime.set(3)).to.equal(true);
        expect(prime.value).to.equal(3);
      })
    })
  })

  describe('Containers', () => {

    describe('List', () => {
      var Strings = List.of(Str);

      it('should set valid array', () => {
        let ss = new Strings;
        ss.set(['yoghurt', 'pops']);
        expect(ss.value).to.equal(Immutable.List(['yoghurt', 'pops']));
      })

      it('should set defaults', () => {
        var DefaultedStrings = Strings.using({default: ['foo', 'bar']});
        let ds = new DefaultedStrings;
        expect(ds.value).to.equal(Immutable.List([]));
        // on an instance
        ds.setDefault();
        expect(ds.value).to.equal(Immutable.List(ds.default));
        // on a class
        let dds = DefaultedStrings.fromDefaults();
        expect(dds.value).to.equal(Immutable.List(dds.default));
      })

      describe('set()', () => {
        it('fails when member set() fails', () => {
          let ss = new Strings;
          expect(ss.set(['cannot be', null])).to.be.false;
        })

        it('returns empty List on failure', () => {
          let ss = new Strings;
          expect(ss.set(['cannot be', null])).to.be.false;
          expect(ss.members.length).to.equal(0);
        })
      })
    })

    describe('Map', () => {
      let ABMap = Map.of(Str.named('a'), Int.named('b'));
      let abMap = new ABMap();

      describe('set()', () => {
        it('should accept object values', () => {
          expect(abMap.set({a: 'abs', b: 6})).to.be.true;
          expect(abMap.members.a.value).to.equal('abs');
          expect(abMap.members.b.value).to.equal(6);
          expect(abMap.value).to.equal(Immutable.Map({a: 'abs', b: 6}));
        })

        it('should report failure when member set fails', () => {
          expect(abMap.set({a: 'abs', b: null})).to.be.false;
          expect(abMap.members.a.value).to.equal(undefined);
          expect(abMap.members.b.value).to.equal(undefined);
          expect(abMap.value).to.equal(Immutable.Map({a: undefined, b: undefined}));
        })

        it('should allow setting of subset of keyspace', () => {
          expect(abMap.set({b: 42})).to.be.true;
          expect(abMap.members.a.value).to.equal(undefined);
          expect(abMap.members.b.value).to.equal(42);
          expect(abMap.value).to.equal(Immutable.Map({a: undefined, b: 42}));

          expect(abMap.set({a: 42})).to.be.true;
          expect(abMap.members.a.value).to.equal('42');
          expect(abMap.members.b.value).to.equal(undefined);
          expect(abMap.value).to.equal(Immutable.Map({a: '42', b: undefined}));
        })
      })
    })
  })

  describe('observation', () => {
    describe('on scalars', () => {
      var s;
      var spy;

      beforeEach(() => {
        s = new Str();
        spy = sinon.spy();
        s.observe(spy);
      })

      it('calls observers once per set()', () => {
        s.observe(spy); // double-loaded
        s.set('chicken');
        expect(spy.callCount).to.equal(2);
        s.set('in a biscuit');
        expect(spy.callCount).to.equal(4);
      })

      it('calls observers despite failing set()', () => {
        expect(s.set(null)).to.be.false;
        expect(spy.callCount).to.equal(1);
        expect(spy.firstCall.args[0]).to.be.false;
        expect(spy.firstCall.args[1]).to.equal(s);
      })

      it('can stop watching', () => {
        s.unobserve(spy);
        s.set('heyo');
        expect(spy.callCount).to.equal(0);
      })
    })

    describe('on List', () => {
      var Strings = List.of(Str);
      var ss;
      var spy;

      beforeEach(() => {
        ss = new Strings();
        spy = sinon.spy();
        ss.observe(spy);
      })

      it('calls observers once per set()', () => {
        ss.set(['yoghurt', 'pops']);
        expect(spy.callCount).to.equal(1);
        expect(spy.firstCall.args[0]).to.be.true;
        expect(spy.firstCall.args[1]).to.equal(ss);
      })

      it('calls observers with the result of the set()', () => {
        ss.set(null);
        expect(spy.callCount).to.equal(1);
        expect(spy.firstCall.args[0]).to.be.false;
        expect(spy.firstCall.args[1]).to.equal(ss);
      })

      it('calls observers of container when child is set', () => {
        ss.set(['uno', 'dos'])
        ss.members[0].set('tres')
        expect(spy.callCount).to.equal(2);
        expect(spy.secondCall.args[0]).to.be.true;
        expect(spy.secondCall.args[1]).to.equal(ss.members[0]);
      })

      it('preserves watchers of children across sets', () => {
        ss.set(['dos', 'cuatro']);
        ss.members[0].observe(spy);
        ss.set(['cuatro', 'ocho']);
        expect(ss.members[0]._watchers).to.contain(spy);
      })
    })

    describe('on Map', () => {
      let ABMap = Map.of(Str.named('a'), Int.named('b'));
      var abMap;
      var spy;

      beforeEach(() => {
        abMap = new ABMap();
        spy = sinon.spy();
        abMap.observe(spy);
      })

      it('calls observers once per set()', () => {
        abMap.set({a: 'foo', b: 3})
        expect(spy.callCount).to.equal(1);
        expect(spy.firstCall.args[0]).to.be.true;
        expect(spy.firstCall.args[1]).to.equal(abMap);
      })

      it('calls observer when child is set', () => {
        abMap.members.b.set(42);
        expect(spy.callCount).to.equal(1);
        expect(spy.firstCall.args[0]).to.be.true;
        expect(spy.firstCall.args[1]).to.equal(abMap.members.b);
      })

      it('calls observer with the result of the set', () => {
        abMap.set({a: null, b: null});
        expect(spy.callCount).to.equal(1);
        expect(spy.firstCall.args[0]).to.be.false;
        expect(spy.firstCall.args[1]).to.equal(abMap);
      })

      it('preserves watchers of children across sets', () => {
        abMap.set({a: 'aaa', b: 3});
        abMap.members.a.observe(spy);
        abMap.set({a: 'AAA', b: 33});
        expect(abMap.members.a._watchers).to.contain(spy);
      })
    })
  })

  describe('validation', () => {
    let ListOfAtLeastThree = List
      .of(Str
        .named('string')
        .validatedBy(Length.AtLeast(3, 'You must enter at least 3 characters')))
      .named('LOALT')
      .validatedBy(Length.AtLeast(3, 'You must enter at least 3 strings'));

    it('should evaluate validators on calls to validate()', () => {
      function IsPositive(msg) {
        return (element, context) => {
          if (element.value < 0) {
            element.addError(msg);
            return false;
          }
          return true;
        }
      }

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
    })

    it('should allow validators access to the entire schema', () => {
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
    })

    it('should report all errors for a Map', () => {
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
      expect(yadda.allErrors).to.eql(Immutable.fromJS({self: [], children: {a: {self: ['Truthy']}, b: {self: ['Not 3']}}}));
    })

    it('should report all errors for a List', () => {
      let loalt = new ListOfAtLeastThree();
      expect(loalt.set(['ab', 'cd'])).to.be.true;
      expect(loalt.validate()).to.be.false;
      expect(loalt.allErrors).to.eql(Immutable.fromJS({
        self: ['You must enter at least 3 strings'],
        children: [
          {self: ['You must enter at least 3 characters']},
          {self: ['You must enter at least 3 characters']}
        ]
      }));
    });

    it('should allow introspection on the validators of an element', () => {
      let loalt = new ListOfAtLeastThree();
      expect(loalt.validatorFactories[0]).to.equal(Length.AtLeast);
      expect(loalt.hasValidator(Length.AtLeast)).to.be.true;
    })

    it('should not confuse us', () => {
      let MyString = Str.validatedBy(Value.Present('hi'));
      let s = new MyString();
      expect(s.validate()).to.be.false;
      expect(s.hasValidator(Value.Present)).to.be.true;
    })
  })
})

describe('Complex schema examples (from idealist.org)', () => {
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

  let Location = Map.of(
    Bool.named('fallback').using({default: false}),
    Str.named('location').validatedBy(fallbackValidator(false, 'Please choose a location')),
    Int.named('geoid').validatedBy(fallbackValidator(false, 'Please choose a location')),
    Str.named('city').validatedBy(fallbackValidator(true, 'Please provide a city name')),
    Str.named('regionCode').validatedBy(fallbackValidator(true, 'Please choose a region')),
    Str.named('countryCode').validatedBy(fallbackValidator(true, 'Please choose a country'))
  )

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
      .using({default: [{fallback: false}]})
      .validatedBy(Length.AtLeast(1, 'You must enter at least 1 address')),
    Str.named('fullName'),
    Str.named('shortName')
      .using({default: ''})
      .validatedBy(
        Value.Present('Short name needed.'),
        Length.AtMost(25, 'Short name must be at most 25 characters')
      ),
    Str.named('streetAddress'),
    Str.named('deliveryDetails'),
    Str.named('ein'),
    Str.named('website'),
    Str.named('description').using({default: ''}),
    List.named('keywords').of(Str).validatedBy(Length.AtLeast(1, 'You must choose at least 1 keyword')),
    Str.named('image')
  );

  it('Traversal', () => {
    const location = new Location();
    const org = Org.fromDefaults();
    expect(location.find('/')).to.eql(location);
    expect(location.members.city.find('/')).to.eql(location);
    expect(location.find('city')).to.eql(location.members.city);
    expect(location.find('city').find('..')).to.eql(location);
    expect(location.find('city').find('../regionCode')).to.eql(location.members.regionCode);
    expect(org.find('addresses/0/fallback')).to.eql(org.members.addresses.members[0].members.fallback);
    expect(org.find('/addresses/0/fallback')).to.eql(org.members.addresses.members[0].members.fallback);
    expect(org.find('/addresses/0/fallback/')).to.eql(org.members.addresses.members[0].members.fallback);
    expect(org.members.addresses.members[0].members.fallback.find('/')).to.eql(org);
    expect(org.members.addresses.members[0].members.fallback.root).to.eql(org);
    expect(org.members.addresses.members[0].members.fallback.parent).to.eql(org.members.addresses.members[0]);
  })

  describe('using POJSOs', () => {
    it('Location', () => {
      let location = new Location();
      expect(location.set({fallback: false, location: 'Boston', geoid: 3})).to.eql(true);
      expect(location.validate()).to.eql(true);
      expect(location.allValid).to.eql(true);
      expect(location.set({fallback: true, city: 'Boston', regionCode: 'US_MA', countryCode: 'US'})).to.eql(true);
      expect(location.validate()).to.eql(true);
      expect(location.set({fallback: true, city: 'Boston', regionCode: {Geo: 'NotApplicable'}, countryCode: 'US'})).to.eql(true);
      expect(location.validate()).to.eql(true);

      expect(location.set({fallback: false, location: '', geoid: 3})).to.eql(true);
      expect(location.validate()).to.eql(false);
      expect(location.allValid).to.eql(false);
      expect(location.allErrors.getIn(['children', 'location', 'self']).size).to.eql(1);
      expect(location.allErrors.getIn(['children', 'location', 'self', 0])).to.eql('Please choose a location');
      expect(location.set({fallback: false, location: 'Boston'})).to.eql(true);
      expect(location.validate()).to.eql(false);
      expect(location.set({fallback: true, countryCode: 'US'})).to.eql(true);
      expect(location.validate()).to.eql(false);
    })

    it('Org', () => {
      let org = Org.fromDefaults();
      expect(org.members.addresses.value).to.have.size(1);
      expect(org.members.type.value).to.eql('nonprofit');
      expect(org.members.description.value).to.eql('');
      expect(org.validate()).to.be.false;
      expect(org.members.addresses.errors.length).to.eql(0);
      expect(org.members.addresses.members[0].members.location.errors.length).to.eql(1);
      expect(org.members.keywords.errors.length).to.eql(1);

      org.set({shortName: 'Marx sometimes types really inappropriate test data, but....'});
      expect(org.validate()).to.be.false;
      expect(org.members.shortName.errors.length).to.eql(1);

      org.set({keywords: ['arts', 'hot sauce']});
      expect(org.members.keywords.validate()).to.be.true;
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
    })
  })

  describe('using Immutable', () => {
    it('Location', () => {
      let location = new Location();
      expect(location.set(Immutable.fromJS({fallback: false, location: 'Boston', geoid: 3}))).to.eql(true);
      expect(location.validate()).to.eql(true);
      expect(location.set(Immutable.fromJS({fallback: true, city: 'Boston', regionCode: 'US_MA', countryCode: 'US'}))).to.eql(true);
      expect(location.validate()).to.eql(true);
      expect(location.set(Immutable.fromJS({fallback: true, city: 'Boston', regionCode: {Geo: 'NotApplicable'}, countryCode: 'US'}))).to.eql(true);
      expect(location.validate()).to.eql(true);

      expect(location.set(Immutable.fromJS({fallback: false, location: '', geoid: 3}))).to.eql(true);
      expect(location.validate()).to.eql(false);
      expect(location.allErrors.getIn(['children', 'location', 'self']).size).to.eql(1);
      expect(location.allErrors.getIn(['children', 'location', 'self', 0])).to.eql('Please choose a location');
      expect(location.set(Immutable.fromJS({fallback: false, location: 'Boston'}))).to.eql(true);
      expect(location.validate()).to.eql(false);
      expect(location.set(Immutable.fromJS({fallback: true, countryCode: 'US'}))).to.eql(true);
      expect(location.validate()).to.eql(false);
    })

    it('Org', () => {
      let org = Org.fromDefaults();
      expect(org.members.type.value).to.eql('nonprofit');
      expect(org.members.description.value).to.eql('');
      expect(org.validate()).to.be.false;
      expect(org.members.addresses.errors.length).to.eql(0);
      expect(org.members.addresses.members[0].members.location.errors.length).to.eql(1);
      expect(org.members.keywords.errors.length).to.eql(1);

      org.set(Immutable.fromJS({shortName: 'Marx sometimes types really inappropriate test data, but....'}));
      expect(org.validate()).to.be.false;
      expect(org.members.shortName.errors.length).to.eql(1);

      org.set(Immutable.fromJS({keywords: ['arts', 'hot sauce']}));
      expect(org.members.keywords.validate()).to.be.true;
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
    })
  })
})
