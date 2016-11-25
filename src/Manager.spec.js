/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import Manager from './Manager';

chai.use(sinonChai);
chai.use(chaiAsPromised);

const form = {
  name: 'test',
};

describe('Manager', () => {
  it('add', () => {
    Manager.add(form);
    expect(Manager.get('test').name).to.eql('test');
  });
  it('remove', () => {
    Manager.add(form);
    Manager.remove('test');
    expect(Manager.get('test')).to.eql(undefined);
  });
  it('reset', () => {
    Manager.add(form);
    Manager.reset();
    expect(Manager.forms.size).to.eql(0);
  });
});
