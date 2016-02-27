import {default as chai, expect} from 'chai';
import chaiImmutable from 'chai-immutable';
chai.use(chaiImmutable);

import sinon from 'sinon';
import Immutable from 'immutable';

import Schema from './src/index';
let {Int, Str, Bool, Enum, Map, List, Set} = Schema;


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
    describe('Set', () => {
      var Ints = Set.of(Int);
      it('should "set" a valid Set', () => {
        let ints = new Ints;
        ints.set([1, 2, 2, 3]);
        expect(ints.value).to.equal(Immutable.Set([1, 2, 3]));
      })

      it('should "set" defaults', () => {
        var DefaultedInts = Ints.using({default: [1, 2, 3, 3]});
        let dints = new DefaultedInts;
        expect(dints.value).to.equal(Immutable.Set([]));
        // on an instance
        dints.setDefault();
        expect(dints.value).to.equal(Immutable.Set(dints.default));
        // on a class
        let ddints = DefaultedInts.fromDefaults();
        expect(ddints.value).to.equal(Immutable.Set(ddints.default));
      })
    })

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
  })
})
