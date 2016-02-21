import {default as chai, expect} from 'chai';
import chaiImmutable from 'chai-immutable';
chai.use(chaiImmutable);

import sinon from 'sinon';
import Immutable from 'immutable';

import {Schema, Validation} from './src/conformist';
let {Int, Str, Bool, Enum, Map, List} = Schema;
let {Value, Length} = Validation;


describe('Type', () => {
  describe('validation', () => {
    let ListOfAtLeastThree = List
      .of(Str
        .named('string')
        .validatedBy(Length.AtLeast(3, 'You must enter at least 3 characters')))
      .named('LOALT')
      .validatedBy(Length.AtLeast(3, 'You must enter at least 3 strings'));

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
    });

    it('should not confuse us', () => {
      let MyString = Str.validatedBy(Value.Present('hi'));
      let s = new MyString();
      expect(s.validate()).to.be.false;
      expect(s.hasValidator(Value.Present)).to.be.true;
    });
  });
});

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
  );

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
  });

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
    });

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
    });
  });

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
    });

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
    });
  });
});
