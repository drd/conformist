import Immutable from 'immutable';
import {isObject, consume} from './util';


class Type {
  constructor(value) {
    this.valid = undefined;
    value !== undefined && this.set(value);
    this._watchers = [];
  }

  observe(watcher) {
    this._watchers.push(watcher);
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
    return this.validatorFactories().indexOf(validator) !== -1;
  }

  validatorFactories() {
    return this.validators.map(v => v.factory);
  }

  static clone(overrides) {
    class cloned extends this {};
    Object.assign(cloned.prototype, overrides);
    return cloned;
  }

  static named(name) {
    return this.clone({name});
  }

  static using(overrides) {
    // maybe pre-process overrides?
    return this.clone(overrides);
  }

  static validatedBy(...validators) {
    return this.clone({validators});
  }

  static fromDefaults() {
    let defaulted = new this();
    defaulted.setDefault();
    return defaulted;
  }
}

Type.prototype.default = undefined;
Type.prototype.validators = [];

class AdaptationError extends Error {};

class Scalar extends Type {
  constructor() {
    super();
    this._watchers = [];
    this._value = undefined;
  }

  value() {
    return this._value;
  }

  allErrors() {
    return this.errors;
  }

  set(raw) {
    try {
      this._value = this.adapt(raw);
    } catch (e) {
      this._value = undefined;
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


class Bool extends Scalar {
  adapt(raw) {
    // TODO: more restrictive?
    return !!raw;
  }
}


class Str extends Scalar {
  adapt(raw) {
    return raw.toString();
  }
}


class Num extends Scalar {
  // ?
}


class Int extends Num {
  adapt(raw) {
    let value = parseInt(raw, 10);
    if (isNaN(value)) {
      throw new AdaptationError(`${value} is not a number`);
    }
    return value;
  }
}

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
    return this.clone({validValues})
  }
}

Enum.prototype.childType = Str;

class Container extends Type {
  validate(context) {
    this.errors = [];
    var success = !!this.memberValues().reduce((valid, member) => {
      var result = member.validate(context);
      return valid && result;
    }, true);
    this.valid = !!this.validators.reduce((valid, validator) => valid &= validator(this, context), success);
    return this.valid;
  }
}

class List extends Container {
  value() {
    return Immutable.List(this.members().map(m => m.value()));
  }

  members() {
    return this._members;
  }

  // aliased for concordance with Container.prototype.validate()
  memberValues() {
    return this._members;
  }

  allErrors() {
    return {
      self: this.errors,
      children: this.members().map(m => m.allErrors())
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
    this._members = [];
    if (!(raw && raw.forEach)) {
      this.notifyWatchers(false, this);
      return false;
    }
    let success = true;
    let items = [];
    raw.forEach(mbr => {
      let member = new this.memberType();
      member.parent = this;
      success &= member.set(mbr);
      member.observe(this.notifyWatchers.bind(this));
      items.push(member);
    });
    this._members = success ? items : this.members();
    this.notifyWatchers(!!success, this);
    return !!success;
  }

  static of(type) {
    return this.clone({memberType: type});
  }
}

List.prototype._members = [];

class Map extends Container {
  constructor(value) {
    super(value);
    // construct an empty schema
    if (!this._members) {
      this.set({});
    }
  }

  value() {
    return Immutable.Map(Object.keys(this._members).reduce((v, m) => {
      v[m] = this._members[m].value();
      return v;
    }, {}));
  }

  // member elements as list
  memberValues() {
    return Object.values(this._members);
  }

  members() {
    return this._members;
  }

  allErrors() {
    return {
      self: this.errors,
      children: Object.entries(this._members).reduce((errors, [k, v]) => {
        errors[k] = v.allErrors();
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
      member.observe(this.notifyWatchers.bind(this));
      return success;
    }, true);

    if (success) {
      // should this.members only be defined here?
      // or in constructor?
      this._members = members;
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
      this.memberValues().forEach(m => m.setDefault());
    }
  }
}


export default {Type, Scalar, Num, Int, Str, Bool, Enum, Container, List, Map};
