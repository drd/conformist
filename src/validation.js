function _Restriction(valueTransformer) {
  return (msg, isFailure) => {
    let validator = (element, context) => {
      if (isFailure(valueTransformer(element))) {
        element.addError(msg);
        return false;
      }
      return true;
    }
    return validator;
  }
  return factory;
}

// Nums
let _ValueRestriction = _Restriction(e => e.value);

// this is "better"???
function _factorize(validators) {
  return Object.entries(validators).reduce((factorized, [name, factory]) => {
    let wrapped = (...args) => {
      let validator = factory(...args);
      validator.factory = factory;
      return validator;
    }
    wrapped.factory = factory;
    factorized[name] = wrapped;
    return factorized;
  }, {})
}

let Value = _factorize({
  // Ok, Present *is* in terms of the serialized property but it's really
  // all about the value. You got me.
  Present: (msg) => _ValueRestriction(msg, v => v !== undefined),
  AtLeast: (min, msg) => _ValueRestriction(msg, v => v < min),
  AtMost: (max, msg) => _ValueRestriction(msg, v => v > max),
  Between: (min, max, msg) => _ValueRestriction(msg, v => v < min || v > max)
})

// Strings & Lists
let _LengthRestriction = _Restriction(e => e.value ? e.value.length : 0);

let Length = _factorize({
  AtLeast: (min, msg) => _LengthRestriction(msg, v => v < min),
  AtMost: (max, msg) => _LengthRestriction(msg, v => v > max),
  Between: (min, max, msg) => _LengthRestriction(msg, v => v < min || v > max),
  Exactly: (count, msg) => _LengthRestriction(msg, v => v === count)
})

export default {Value, Length};
