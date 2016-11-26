/* eslint-disable no-unused-expressions */
/* eslint-disable no-new */
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import { Map, Stack } from 'immutable';
import Form from './Form';
import Manager from './Manager';

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Form', () => {
  describe('constructor', () => {
    beforeEach(() => {
      Manager.reset();
    });
    it('adds itself to Manager on initialization', () => {
      new Form('test');
      const form = Manager.get('test');
      expect(form).to.be.ok;
      expect(form.name).to.eql('test');
    });
    it('does not add itself to Manager if option is disabled', () => {
      new Form('test', null, { addToManager: false });
      const form = Manager.get('test');
      expect(form).to.eql(undefined);
    });
    it('must have a name', () => {
      expect(() => new Form()).to.throw(Error);
      expect(() => new Form('')).to.throw(Error);
      expect(() => new Form(' ')).to.throw(Error);
    });
    it('can use initial state', () => {
    });
  });
  describe('fields', () => {
    it('set field value', () => {
      const form = new Form('form');
      form.setField('field1', {
        value: 'value1',
      });
      const field = form.store.getState().getIn(['form', 'fields', 'field1']);
      expect(field.get('value')).to.eql('value1');
    });
    it('sets field value, errors', () => {
      const form = new Form('form');
      form.setField('field1', {
        value: 'value1',
        error: 'error1',
      });
      const field = form.store.getState().getIn(['form', 'fields', 'field1']);
      expect(field.get('value')).to.eql('value1');
      expect(field.get('errors').first()).to.eql('error1');
    });
    it('clears errors if passed null', () => {
      const form = new Form('form');
      form.setField('field1', {
        value: 'value1',
        error: 'error1',
      });
      form.setField('field1', {
        error: 'error2',
      });
      let field = form.store.getState().getIn(['form', 'fields', 'field1']);
      expect(field.get('errors').size).to.eql(2);
      form.setField('field1', {
        error: null,
      });
      field = form.store.getState().getIn(['form', 'fields', 'field1']);
      expect(field.get('errors').size).to.eql(0);
    });
    it('get field', () => {
      const form = new Form('form');
      form.setField('field1', {
        value: 'value1',
      });
      const field = form.getField('field1');
      expect(field.get('value')).to.eql('value1');
    });
    it('remove field', () => {
      const form = new Form('form');
      form.setField('field1', {
        value: 'value1',
      });
      form.removeField('field1');
      expect(form.getField('field1')).to.eql(undefined);
    });
    it('reset field', () => {
      const form = new Form('form');
      form.setField('field1', {
        value: 'value1',
        error: 'error1',
      });
      form.resetField('field1');
      const field = form.getField('field1');
      expect(field.get('value')).to.eql('');
      expect(field.get('errors').size).to.eql(0);
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
      form.addError('error1');
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
      form.setField('field1', {
        value: 'value1',
        error: 'error1',
      });
      expect(form.hasErrors()).to.eql(true);
    });
    it('has errors - form and filed', () => {
      const form = new Form('form');
      form.setField('field1', {
        value: 'value1',
        error: 'error1',
      });
      const field = form.getField('field1');
      expect(field.get('errors').first()).to.eql('error1');
      expect(form.hasErrors()).to.eql(true);
    });
  });
  describe('form', () => {
    it('reset', () => {
      const form = new Form('form');
      form.setField('field1', {
        value: 'value1',
        error: 'error1',
      });
      form.resetForm();
      const state = form.getState();
      expect(state).to.eql(Map({
        fields: Map(),
        errors: Stack(),
      }));
    });
  });
});
