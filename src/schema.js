import {isObject, consume} from './util';


class Type {
  constructor(value) {
    this.raw = null;
    this.serialized = '';
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
    defaulted.set(defaulted.default);
    return defaulted;
  }
}

Type.prototype.default = null;
Type.prototype.validators = [];

class AdaptationError extends Error {};

class Scalar extends Type {
  constructor() {
    super();
    this._watchers = [];
    this.value = null;
  }

  get allErrors() {
    return this.errors;
  }

  set(raw) {
    this.raw = raw;
    try {
      this.value = this.adapt(raw);
    } catch (e) {
      // serialize must not throw an error!
      this.serialized = this.serialize(raw);
      this.value = null;
      this.notifyWatchers(false, this);
      return false;
    }
    this.serialized = this.serialize(this.value);
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

  serialize(value) {
    try {
      return value.toString();
    } catch(e) {
      return '';
    }
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

  serialize(value) {
    try {
      return this.childSchema.prototype.serialize(value);
    } catch(e) {
      return '';
    }
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
    let success = !!this.memberValues.reduce((valid, member) => {
      var result = member.validate(context);
      return valid && result;
    }, true);
    return !!this.validators.reduce((valid, validator) => valid &= validator(this, context), success);
  }
}

class List extends Container {
  get value() {
    return this.members.map(m => m.value);
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

  set(raw) {
    this.raw = raw;
    if (!(raw && raw.forEach)) {
      return false;
    }
    let success = true;
    let items = [];
    raw.forEach(mbr => {
      let member = new this.memberType();
      member.parent = this;
      success = success & member.set(mbr);
      member.observe(this.notifyWatchers.bind(this));
      items.push(member);
    });
    this.serialized = this.serialize(raw);
    this.members = success ? items : [];
    this.notifyWatchers(!!success, this);
    return !!success;
  }

  serialize(value = []) {
    return '[' +
      value.map(v => `"${this.memberType.prototype.serialize(v)}"`).join(", ") +
    ']';
  }

  static of(type) {
    return this.clone({memberType: type});
  }
}

List.prototype.members = [];

class Map extends Container {
  constructor(value) {
    super(value);
    // construct an empty schema
    if (this.value === null) {
      this.set({});
    }
  }

  get value() {
    if (!this._members) {
      return null;
    }
    return Object.keys(this._members).reduce((v, m) => {
      v[m] = this._members[m].value;
      return v;
    }, {});
  }

  get default() {
    return Object.entries(this.memberSchema).reduce((defaults, [k, v]) => {
      if (v.prototype.default !== undefined) {
        defaults[k] = v.prototype.default;
      }
      return defaults;
    }, {});
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
    this.raw = raw;
    if (!(raw.keys || isObject(raw))) {
      return false;
    }
    let get = (o, k)  => o.keys ? o = o.get(k) : o[k];
    let keys = Object.keys(this.memberSchema);
    let members = {}
    let success = !!keys.reduce((success, k) => {
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

    try {
      this.serialized = this.serialize(raw);
    } catch(e) {
      this.serialized = this.serialize({});
    }

    if (success) {
      // should this.members only be defined here?
      // or in constructor?
      this.members = members;
    } else {
      this.set({}, {notify: false})
    }
    if (notify) this.notifyWatchers(success, this);
    return success;
  }

  serialize(value) {
    return '{' + Object.entries(this.memberSchema).reduce((serialized, [key, memberSchema]) => {
      return serialized.concat([`${key}: "${memberSchema.prototype.serialize(value[key])}"`]);
    }, []).join(', ') + '}';
  }

  static of(...members) {
    let memberSchema = members.reduce((ms, m) => {
      ms[m.prototype.name] = m;
      return ms;
    }, {});
    return this.clone({memberSchema});
  }

  static fromDefaults() {
    let defaulted = new this();
    Object.entries(defaulted.default).forEach(([k,v]) => defaulted.members[k].set(v));
    return defaulted;
  }
}


export default {Type, Scalar, Num, Int, Str, Bool, Enum, Container, List, Map};
