/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import FormCollection from './FormCollection';

chai.use(sinonChai);
chai.use(chaiAsPromised);

const form = {
  name: 'test',
};

describe('FormCollection', () => {
  it('add', () => {
    FormCollection.add(form);
    expect(FormCollection.get('test').name).to.eql('test');
  });
  it('remove', () => {
    FormCollection.add(form);
    FormCollection.remove('test');
    expect(FormCollection.get('test')).to.eql(undefined);
  });
  it('reset', () => {
    FormCollection.add(form);
    FormCollection.reset();
    expect(FormCollection.forms.size).to.eql(0);
  });
});
