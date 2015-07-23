function _Restriction(valueTransformer) {
  return (msg, isFailure) => {
    return (element, context) => {
      if (isFailure(valueTransformer(element))) {
        element.addError(msg);
        return false;
      }
      return true;
    }
  }
}

// Nums
let _ValueRestriction = _Restriction(e => e.value);
let _SerializedRestriction = _Restriction(e => e.serialized);

let Value = {
  // Ok, Present *is* in terms of the serialized property but it's really
  // all about the value. You got me.
  Present: (msg) => _SerializedRestriction(msg, v => v === ''),
  AtLeast: (min, msg) => _ValueRestriction(msg, v => v < min),
  AtMost: (max, msg) => _ValueRestriction(msg, v => v > max),
  Between: (min, max, msg) => _ValueRestriction(msg, v => v < min || v > max)
}

// Strings & Lists
let _LengthRestriction = _Restriction(e => e.value.length);

let Length = {
  AtLeast: (min, msg) => _LengthRestriction(msg, v => v < min),
  AtMost: (max, msg) => _LengthRestriction(msg, v => v > max),
  Between: (min, max, msg) => _LengthRestriction(msg, v => v < min || v > max),
  Exactly: (count, msg) => _LengthRestriction(msg, v => v === count)
}

export default {Value, Length};
