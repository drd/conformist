let isObject = o => toString.call(o) === '[object Object]'

let consume = i => {
  let iterator = i && i.keys;
  if (!iterator) return;
  let arr = [];
  while (res = iterator.next(), !res.isDone) arr.push(res.value);
  return res;
}



class Type {
  constructor(value) {
    this.raw = null;
    this.valid = undefined;
    value && this.set(value);
  }

  addError(error) {
    this.errors.push(error);
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
Type.prototype.optional = false;
Type.prototype.validators = [];

class AdaptationError extends Error {};

class Scalar extends Type {
  constructor() {
    super();
    this.value = this.serialized = null;
  }

  set(raw) {
    this.raw = raw;
    try {
      this.value = this.adapt(raw);
    } catch (e) {
      try {
        this.serialized = this.serialize(raw);
      } catch (e) {
        this.serialized = '';
      }
      this.value = null;
      return false;
    }
    this.serialized = this.serialize(this.value);
    return true;
  }

  validate(state) {
    this.errors = [];

    if (this.value === null) {
      this.valid = this.optional;
      return this.valid;
    }

    this.valid = this.validators.reduce((valid, v) => {
      if (valid) {
        valid = v.call ? v.call(this, state) : v.validate(this, state);
      }
      return valid;
    }, true);

    return this.valid;
  }
}


class Str extends Scalar {
  adapt(raw) {
    return raw.toString();
  }

  serialize(value) {
    return value;
  }
}


class Int extends Scalar {
  adapt(raw) {
    let value = parseInt(raw, 10);
    if (isNaN(value)) {
      throw new AdaptationError(`${value} is not a number`);
    }
    return value;
  }

  serialize(value) {
    return value.toString();
  }
}

class Container extends Type {
  validate(state) {
    this.errors = [];
    let success = !!this.members.reduce((valid, member) => valid &= member.validate(state), true);
    return !!this.validators.reduce((valid, validator) => valid &= validator.validate(this, state), success);
  }
}

class List extends Container {
  get value() {
      return this.members.map(m => m.value);
  }

  get members() {
    return this._members;
  }

  set members(members) {
    this._members = members;
  }

  set(raw) {
    this.raw = raw;
    if (!raw.forEach) {
      return false;
    }
    let success = true;
    let items = [];
    raw.forEach(mbr => {
        let member = new this.memberType();
        success = success & member.set(mbr);
        items.push(member);
    })
    this.members = success ? items : [];
  }

  static of(type) {
    return this.clone({memberType: type});
  }
}

List.prototype.members = [];

class Map extends Container {
  get value() {
    return Object.keys(this._members).reduce((v, m) => { v[m] = this._members[m].value; return v; }, {});
  }

  // member elements as list
  get members() {
    return Object.keys(this._members).map(m => this._members[m]);
  }

  set members(members) {
    this._members = members;
  }

  set(raw) {
    this.raw = raw;
    if (!(raw.keys || isObject(raw))) {
      return false;
    }
    let get = (o, k)  => o.keys ? o = o.get(k) : o[k];
    let keys = consume(raw.keys) || Object.keys(raw);
    let members = {}
    let success = keys.reduce((success, k) => {
      let member = new this.memberSchema[k]();
      members[k] = member;
      return success &= member.set(raw[k]);
    }, true);
    if (success) {
      // should this.members only be defined here?
      // or in constructor?
      this.members = members;
    }
    return success;
  }

  static of(...members) {
    let memberSchema = members.reduce((ms, m) => {
      ms[m.prototype.name] = m;
      return ms;
    }, {});
    return this.clone({memberSchema});
  }
}


class Validator {
  noteError(element, state, options) {
    let message = options.message || this[options.key];
    element.addError(message);
    return false;
  }
}


export default {Type, Validator, Scalar, Int, Str, Container, List, Map};