import {Str, List, Num} from './schema';


class Validator {
  noteError(element, context, options) {
    let message = options.message || this[options.key];
    element.addError(message);
    return false;
  }
}


class Constrained extends Validator {
  constraint() {
    throw new Error("Unimplmented")
  }

  constructor(extreme) {
    super();
    this.extreme = extreme;
  }

  validate(element, state) {
    if (element instanceof Str) {
      if (this.constraint(element.value.length, this.extreme)) {
        return this.noteError(element, state, {key: 'invalidString'});
      }
    } else if (element instanceof List) {
      if (this.constraint(element.value.length, this.extreme)) {
        return this.noteError(element, state, {key: 'invalidList'});
      }
    } else if (element instanceof Num) {
      if (this.constraint(element.value, this.extreme)) {
        return this.noteError(element, state, {key: 'invalidNum'});
      }
    } else {
      throw new Error('Min cannot be used on this type', element);
    }
    return true;
  }
}


class Min extends Constrained {
  invalidNum = '{name} must be greater than or equal to {min}'
  invalidList = '{name} must contain {min} or more elements'
  invalidString = '{name} must be at least {min} characters long'

  constraint(value, min) {
    return value < min;
  }
}


class Max extends Constrained {
  invalidNum = '{name} must be less than or equal to {max}'
  invalidList = '{name} must contain {max} or fewer elements'
  invalidString = '{name} must be shorter than {max} characters long'

  constraint(value, min) {
    return value > min;
  }
}


export default {Validator, Min, Max};
