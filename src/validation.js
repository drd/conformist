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

let Value = {
  AtLeast: (msg, min) => _ValueRestriction(msg, v => v < min),
  AtMost: (msg, max) => _ValueRestriction(msg, v => v > max),
  Between: (msg, min, max) => _ValueRestriction(msg, v => v < min || v > max)
}

// Strings & Lists
let _LengthRestriction = _Restriction(e => e.value.length);

let Length = {
  AtLeast: (msg, min) => _LengthRestriction(msg, v => v < min),
  AtMost: (msg, max) => _LengthRestriction(msg, v => v > max),
  Between: (msg, min, max) => _LengthRestriction(msg, v => v < min || v > max),
  Exactly: (msg, count) => _LengthRestriction(msg, v => v === count)
}

export default {Value, Length};
