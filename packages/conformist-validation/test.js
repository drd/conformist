import {default as chai, expect} from 'chai';
import chaiImmutable from 'chai-immutable';
chai.use(chaiImmutable);

import Immutable from 'immutable';

import Validation from './src/index';
let {Value, Length} = Validation;

describe('Validation', () => {
  it('will test Value');
  it('will test Length');
})
