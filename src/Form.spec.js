/* eslint-disable no-unused-expressions */
/* eslint-disable no-new */
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import chaiAsPromised from 'chai-as-promised';
import { Map, Stack } from 'immutable';
import Form, { filterValidate } from './Form';
import FormCollection from './FormCollection';

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Form', () => {
  describe('constructor', () => {
    beforeEach(() => {
      FormCollection.reset();
    });
    it('adds itself to FormCollection on initialization', () => {
      new Form('test');
      const form = FormCollection.get('test');
      expect(form).to.be.ok;
      expect(form.name).to.eql('test');
    });
    it('does not add itself to FormCollection if option is disabled', () => {
      new Form('test', null, { addToFormCollection: false });
      const form = FormCollection.get('test');
      expect(form).to.eql(undefined);
    });
    it('must have a name', () => {
      expect(() => new Form()).to.throw(Error);
      expect(() => new Form('')).to.throw(Error);
      expect(() => new Form(' ')).to.throw(Error);
    });
    it('can use initial state', () => {
      const form = new Form('test', {
        fields: {
          field1: {
            value: 'value1',
            errors: ['error1'],
          },
        },
        errors: ['error2'],
      });

      const state = form.getState();
      expect(state.getIn(['fields', 'field1', 'value'])).to.eql('value1');
      expect(state.getIn(['fields', 'field1', 'errors']).first()).to.eql('error1');
      expect(state.get('errors').first()).to.eql('error2');
    });
  });
  describe('fields', () => {
    it('set field value', () => {
      const form = new Form('form');
      form.setField('field1', 'value1');
      const field = form.store.getState().getIn(['form', 'fields', 'field1']);
      expect(field.get('value')).to.eql('value1');
    });
    it('sets field value, errors', () => {
      const form = new Form('form');
      form.setField('field1', 'value1', 'error1');
      const field = form.store.getState().getIn(['form', 'fields', 'field1']);
      expect(field.get('value')).to.eql('value1');
      expect(field.get('errors').first()).to.eql('error1');
    });
    it('clears errors if passed null', () => {
      const form = new Form('form');
      form.setField('field1', 'value1', 'error1');
      form.setField('field1', null, 'error2');
      let field = form.store.getState().getIn(['form', 'fields', 'field1']);
      expect(field.get('errors').size).to.eql(2);
      form.setField('field1', null, null);
      field = form.store.getState().getIn(['form', 'fields', 'field1']);
      expect(field.get('errors').size).to.eql(0);
    });
    it('get field', () => {
      const form = new Form('form');
      form.setField('field1', 'value1', 'error1');
      const field = form.getField('field1');
      expect(field.get('value')).to.eql('value1');
    });
    it('remove field', () => {
      const form = new Form('form');
      form.setField('field1', 'value1');
      form.removeField('field1');
      expect(form.getField('field1')).to.eql(Map({
        value: '',
        errors: Stack(),
      }));
    });
    it('reset field', () => {
      const form = new Form('form');
      form.setField('field1', 'value1', 'error1');
      form.resetField('field1');
      const field = form.getField('field1');
      expect(field.get('value')).to.eql('');
      expect(field.get('errors').size).to.eql(0);
    });
    it('returns empty map for field that does not exist', () => {
      const form = new Form('form');
      const field = form.getField('field1');
      expect(field).to.eql(Map({
        value: '',
        errors: Stack(),
      }));
    });
    it('getFieldValues', () => {
      const form = new Form('test', {
        fields: {
          field1: {
            value: 'value1',
          },
          field2: {
            value: 'value2',
          },
          field3: {

          },
        },
      });

      expect(form.getFieldValues()).to.eql(Map({
        field1: 'value1',
        field2: 'value2',
        field3: '',
      }));
    });
  });
  describe('errors', () => {
    it('add error', () => {
      const form = new Form('form');
      form.addError('error1');
      expect(form.getState().get('errors').first()).to.eql('error1');
    });
    it('clear errors', () => {
      const form = new Form('form');
      form.setField('field1', null, 'error1');
      form.addError('error2');
      form.clearErrors();
      expect(form.getState().get('errors').size).to.eql(0);
    });
    it('has errors - form level', () => {
      const form = new Form('form');
      form.addError('error1');
      expect(form.hasErrors()).to.eql(true);
    });
    it('has errors - field level', () => {
      const form = new Form('form');
      form.setField('field1', 'value1', 'error1');
      expect(form.hasErrors()).to.eql(true);
    });
    it('has errors - form and filed', () => {
      const form = new Form('form');
      form.setField('field1', 'value1', 'error1');
      const field = form.getField('field1');
      expect(field.get('errors').first()).to.eql('error1');
      expect(form.hasErrors()).to.eql(true);
    });
  });
  describe('form', () => {
    it('reset', () => {
      const form = new Form('form');
      form.setField('field1', 'value1', 'error1');
      form.resetForm();
      const state = form.getState();
      expect(state).to.eql(Map({
        fields: Map(),
        errors: Stack(),
      }));
    });
  });
  describe('submit', () => {
    it('resolves if form has no errors, calls onSuccess', (done) => {
      const initialState = {
        fields: {
          field1: {
            value: 'value1',
          },
          field2: {
            value: 'value2',
          },
        },
      };

      const form = new Form('form', initialState);

      form.onSuccess = sinon.spy();

      const promise = new Promise((resolve) => {
        resolve('good');
      });

      form.submit(promise).then((res) => {
        expect(res).to.eql('good');
        expect(form.onSuccess).to.have.been.called;
        done();
      });
    });
    it('can use promise from handleSubmit', (done) => {
      const initialState = {
        fields: {
          field1: {
            value: 'value1',
          },
          field2: {
            value: 'value2',
          },
        },
      };

      const form = new Form('form', initialState);

      const promise = new Promise((resolve) => {
        resolve('good');
      });

      form.handleSubmit(promise);

      form.submit().then((res) => {
        expect(res).to.eql('good');
        done();
      });
    });
    it('rejects if form has errors', (done) => {
      const initialState = {
        fields: {
          field1: {
            value: 'value1',
          },
          field2: {
            value: 'value2',
            validate: () => 'error',
          },
        },
      };

      const form = new Form('form', initialState);

      const promise = new Promise((resolve) => {
        resolve('good');
      });

      form.submit(promise).catch((err) => {
        expect(err).to.eql('Validation failed');
        done();
      });
    });
    it('rejects and calls on failure if promise fails', (done) => {
      const initialState = {
        fields: {
          field1: {
            value: 'value1',
          },
          field2: {
            value: 'value2',
          },
        },
      };

      const form = new Form('form', initialState);

      form.onFailure = sinon.spy();

      const promise = new Promise((resolve, reject) => {
        reject('bad');
      });

      form.submit(promise).catch((err) => {
        expect(err).to.eql('bad');
        expect(form.onFailure).to.have.been.called;
        done();
      });
    });
  });
  describe('filterValidate', () => {
    it('filters validate keys', () => {
      const initialState = {
        fields: {
          field1: {
            value: 'value1',
            validate: () => 'error',
          },
          field2: {
            value: 'value2',
            validate: () => 'error',
          },
        },
        errors: ['error'],
        validate: () => 'error',
      };
      const { filteredState, fieldValidators, formValidators } = filterValidate(initialState);
      expect(formValidators).to.be.array;
      expect(fieldValidators.field1).to.be.array;
      expect(fieldValidators.field2).to.be.array;
      expect(filteredState).to.eql({
        fields: {
          field1: {
            value: 'value1',
          },
          field2: {
            value: 'value2',
          },
        },
        errors: ['error'],
      });
    });
  });
  describe('validate', () => {
    it('can validate form', () => {
      const initialState = {
        fields: {
          field1: {
            validate: [() => 'error1', () => 'error2'],
          },
          field2: {
            value: 'value2',
          },
        },
        validate: () => 'error3',
      };
      const form = new Form('test', initialState);
      const isValid = form.validate();
      expect(isValid).to.eql(false);
      const state = form.getState();
      expect(state.getIn(['fields', 'field1', 'errors']).size).to.eql(2);
      expect(state.get('errors').size).to.eql(1);
    });
  });
});
