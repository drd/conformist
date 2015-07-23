import {Str, List, Num} from './schema';


class Validator {
  processTemplate(template, element, context) {
    let tokens = (template.match(/({[^}].+?)\}/gm) || [])
      .map(t => [new RegExp(t, 'g'), t.slice(1, -1)]);
    return tokens.reduce((processed, [token, key], i) => {
      let substitution = this[key] || element[key];
      return processed.replace(token, substitution);
    }, template);
  }
  noteError(element, context, options) {
    let messageTemplate = options.message || this[options.key];
    let message = this.processTemplate(messageTemplate, element, context);
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
      throw new Error(`Min cannot be used on this type: ${element}`);
    }
    return true;
  }
}


class Min extends Constrained {
  invalidNum = '{name} must be greater than or equal to {extreme}'
  invalidList = '{name} must contain {extreme} or more elements'
  invalidString = '{name} must be at least {extreme} characters long'

  constraint(value, min) {
    return value < min;
  }
}


class Max extends Constrained {
  invalidNum = '{name} must be less than or equal to {extreme}'
  invalidList = '{name} must contain {extreme} or fewer elements'
  invalidString = '{name} must be shorter than {extreme} characters long'

  constraint(value, min) {
    return value > min;
  }
}


export default {Validator, Min, Max};
