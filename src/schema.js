import Immutable from 'immutable';
import {isObject, consume} from './util';


// Thank you IE, for making this necessary
// Per http://babeljs.io/docs/advanced/caveats/, static methods do not
// propagate down the inheritance chain because __proto__ is not a thing.
// Decorate any concrete schema class with this to ensure that it and any
// cloned versions of itself will have these static methods.
function staticify(cls) {
  Object.assign(cls, {
    clone(overrides) {
      class cloned extends this {};
      Object.assign(cloned.prototype, overrides);
      staticify(cloned);
      // Also, thank you IE, for making this necessary
      Reflect.ownKeys(this).forEach(k => {
        if (!cloned.hasOwnProperty(k)) {
          cloned[k] = this[k];
        }
      })
      return cloned;
    },

    named(name) {
      return this.clone({name});
    },

    using(overrides) {
      // maybe pre-process overrides?
      return this.clone(overrides);
    },

    validatedBy(...validators) {
      return this.clone({validators});
    },

    fromDefaults() {
      let defaulted = new this();
      defaulted.setDefault();
      return defaulted;
    }
  });
}


class Type {
  constructor(value) {
    this.valid = undefined;
    value !== undefined && this.set(value);
    this._watchers = [];
  }

  observe(watcher) {
    this._watchers.push(watcher);
  }

  unobserve(watcher) {
    this._watchers = this._watchers.filter(w => w !== watcher);
  }

  notifyWatchers(...args) {
    this._watchers.forEach(watcher => watcher(...args));
  }

  addError(error) {
    this.errors.push(error);
  }

  setDefault() {
    this.set(this.default);
  }

  hasValidator(validator) {
    return this.validatorFactories.indexOf(validator) !== -1;
  }

  get validatorFactories() {
    return this.validators.map(v => v.factory);
  }
}

Type.prototype.default = undefined;
Type.prototype.validators = [];

class AdaptationError extends Error {};

class Scalar extends Type {
  constructor() {
    super();
    this._watchers = [];
    this.value = undefined;
  }

  get allErrors() {
    return this.errors;
  }

  set(raw) {
    try {
      this.value = this.adapt(raw);
    } catch (e) {
      this.value = undefined;
      this.notifyWatchers(false, this);
      return false;
    }
    this.notifyWatchers(true, this);

    return true;
  }

  validate(context) {
    this.errors = [];

    this.valid = this.validators.reduce((valid, v) => {
      return valid && v(this, context);
    }, true);

    return this.valid;
  }
}


@staticify
class Bool extends Scalar {
  adapt(raw) {
    // TODO: more restrictive?
    return !!raw;
  }
}


@staticify
class Str extends Scalar {
  adapt(raw) {
    return raw.toString();
  }
}


class Num extends Scalar {
  // ?
}


@staticify
class Int extends Num {
  adapt(raw) {
    let value = parseInt(raw, 10);
    if (isNaN(value)) {
      throw new AdaptationError(`${value} is not a number`);
    }
    return value;
  }
}


@staticify
class Enum extends Scalar {
  constructor(value) {
    super();
    this.childSchema = new this.childType();
    if (value !== undefined) {
      this.set(value);
    }
  }

  adapt(raw) {
    let value = this.childSchema.adapt(raw);
    if (!this.validValue(value)) {
      throw new AdaptationError();
    }
    return value;
  }

  validValue(value) {
    return this.validValues.indexOf(value) !== -1;
  }

  static of(childType) {
    return this.clone({childType});
  }

  static valued(validValues) {
    return this.clone({validValues});
  }
}

Enum.prototype.childType = Str;

class Container extends Type {
  validate(context) {
    this.errors = [];
    var success = !!this.memberValues.reduce((valid, member) => {
      var result = member.validate(context);
      return valid && result;
    }, true);
    this.valid = !!this.validators.reduce((valid, validator) => valid &= validator(this, context), success);
    return this.valid;
  }
}


@staticify
class List extends Container {
  get value() {
    return Immutable.List(this.members.map(m => m.value));
  }

  get members() {
    return this._members;
  }

  // aliased for concordance with Container.prototype.validate()
  get memberValues() {
    return this._members;
  }

  set members(members) {
    this._members = members;
  }

  get allErrors() {
    return {
      self: this.errors,
      children: this.members.map(m => m.allErrors)
    };
  }

  // Attempt to convert each member of raw array to the
  // member type of the List. Any failure will result in an
  // empty array for this.members.

  // TODO: short-circuit conversion if any member fails.
  set(raw) {
    if (raw && raw.toJS) {
      raw = raw.toJS();
    }
    let previousMembers = this.members || [];
    this.members = [];
    if (!(raw && raw.forEach)) {
      this.notifyWatchers(false, this);
      return false;
    }
    let success = true;
    let items = [];
    raw.forEach((mbr, i) => {
      let member = new this.memberType();
      member.parent = this;
      success &= member.set(mbr);
      // keep around any watchers that were present on the previous member
      if (previousMembers[i] && previousMembers[i]._watchers) {
        member._watchers = previousMembers[i]._watchers;
      } else {
        member.observe(this.notifyWatchers.bind(this));
      }
      items.push(member);
    });
    this.members = success ? items : this.members;
    this.notifyWatchers(!!success, this);
    return !!success;
  }

  static of(type) {
    return this.clone({memberType: type});
  }
}

List.prototype.members = [];


@staticify
class Map extends Container {
  constructor(value) {
    super(value);
    // construct an empty schema
    if (!this._members) {
      this.set({});
    }
  }

  get value() {
    return Immutable.Map(Object.keys(this._members).reduce((v, m) => {
      v[m] = this._members[m].value;
      return v;
    }, {}));
  }

  // member elements as list
  get memberValues() {
    return Object.values(this._members);
  }

  get members() {
    return this._members;
  }

  set members(members) {
    this._members = members;
  }

  get allErrors() {
    return {
      self: this.errors,
      children: Object.entries(this.members).reduce((errors, [k, v]) => {
        errors[k] = v.allErrors;
        return errors;
      }, {})
    };
  }

  set(raw, {notify = true} = {}) {
    if (raw && raw.toJS) {
      raw = raw.toJS();
    }
    let success = true;
    if (raw === undefined) {
      raw = {};
    }
    if (!isObject(raw)) {
      raw = {}
      success = false;
    }
    let keys = Object.keys(this.memberSchema);
    let members = {}
    success = !!keys.reduce((success, k) => {
      let member = new this.memberSchema[k]();
      member.name = k;
      member.parent = this;
      members[k] = member;
      if (raw[k] !== undefined) {
        success &= member.set(raw[k]);
      }
      // keep around any watchers that were present on the previous member
      if (this.members && this.members[k]) {
        members[k]._watchers = this.members[k]._watchers;
      } else {
        member.observe(this.notifyWatchers.bind(this));
      }
      return success;
    }, true);

    if (success) {
      // should this.members only be defined here?
      // or in constructor?
      this.members = members;
    } else {
      // TODO: We don't need to do this if raw was not an object.
      this.set({}, {notify: false})
    }
    if (notify) this.notifyWatchers(success, this);
    return success;
  }

  static of(...members) {
    let memberSchema = members.reduce((ms, m) => {
      ms[m.prototype.name] = m;
      return ms;
    }, {});
    return this.clone({memberSchema});
  }

  setDefault() {
    if (this.default) {
      this.set(this.default);
    } else {
      this.memberValues.forEach(m => m.setDefault());
    }
  }
}


export default {Type, Scalar, Num, Int, Str, Bool, Enum, Container, List, Map};
