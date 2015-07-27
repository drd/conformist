function _Restriction(valueTransformer) {
  let factory = (name, msg, isFailure) => {
    let validator = (element, context) => {
      if (isFailure(valueTransformer(element))) {
        element.addError(msg);
        return false;
      }
      return true;
    }
    validator._name = name;
//    validator.factory = factory;
    return validator;
  }
  return factory;
}

// Nums
let _ValueRestriction = _Restriction(e => e.value);
let _SerializedRestriction = _Restriction(e => e.serialized);

let Value = {
  // TODO: a nicer way for handling names?
  // Ok, Present *is* in terms of the serialized property but it's really
  // all about the value. You got me.
  Present: (msg) => _SerializedRestriction('Present', msg, v => v === ''),
  AtLeast: (min, msg) => _ValueRestriction('AtLeast', msg, v => v < min),
  AtMost: (max, msg) => _ValueRestriction('AtMost', msg, v => v > max),
  Between: (min, max, msg) => _ValueRestriction('Between', msg, v => v < min || v > max)
}

// Strings & Lists
let _LengthRestriction = _Restriction(e => e.value ? e.value.length : 0);

let Length = {
  AtLeast: (min, msg) => _LengthRestriction('AtLeast', msg, v => v < min),
  AtMost: (max, msg) => _LengthRestriction('AtMost', msg, v => v > max),
  Between: (min, max, msg) => _LengthRestriction('Between', msg, v => v < min || v > max),
  Exactly: (count, msg) => _LengthRestriction('Exactly', msg, v => v === count)
}

export default {Value, Length};
