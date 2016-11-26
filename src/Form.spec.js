/* eslint-disable no-unused-expressions */
/* eslint-disable no-new */
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
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
    it('sets field value, errors, and warnings', () => {
      const form = new Form('form');
      form.setField('field1', {
        value: 'value1',
        error: 'error1',
        warning: 'warning1',
      });
      const field = form.store.getState().getIn(['form', 'fields', 'field1']);
      expect(field.get('value')).to.eql('value1');
      expect(field.get('errors').first()).to.eql('error1');
      expect(field.get('warnings').first()).to.eql('warning1');
    });
    it('clears errors and warnings if passed null', () => {
      const form = new Form('form');
      form.setField('field1', {
        value: 'value1',
        error: 'error1',
        warning: 'warning1',
      });
      form.setField('field1', {
        error: 'error2',
        warning: 'warning2',
      });
      let field = form.store.getState().getIn(['form', 'fields', 'field1']);
      expect(field.get('errors').size).to.eql(2);
      expect(field.get('warnings').size).to.eql(2);
      form.setField('field1', {
        error: null,
        warning: null,
      });
      field = form.store.getState().getIn(['form', 'fields', 'field1']);
      expect(field.get('errors').size).to.eql(0);
      expect(field.get('warnings').size).to.eql(0);
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
    it('clear field', () => {
      const form = new Form('form');
      form.setField('field1', {
        value: 'value1',
        error: 'error1',
        warning: 'warning1',
      });
      form.clearField('field1');
      const field = form.getField('field1');
      expect(field.get('value')).to.eql('');
      expect(field.get('errors').size).to.eql(0);
      expect(field.get('warnings').size).to.eql(0);
    });
  });
});
