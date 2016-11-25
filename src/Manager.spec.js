/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import Manager from './Manager';

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Manager', () => {
  it('add', () => {
    const form = {
      name: 'test',
    };
    Manager.add(form);
    expect(Manager.get('test').name).to.eql('test');
  });
  it('remove', () => {
    const form = {
      name: 'test',
    };
    Manager.add(form);
    Manager.remove('test');
    expect(Manager.get('test')).to.eql(undefined);
  });
});
