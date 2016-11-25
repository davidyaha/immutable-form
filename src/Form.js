import Manager from './Manager';

class Form {
  constructor(name, initialState, options = { addToManager: true }) {
    this.name = name;
    if (!(typeof this.name === 'string') || this.name.trim().length === 0) {
      throw new Error('Form must have a name');
    }
    if (options.addToManager) {
      Manager.add(this);
    }
  }
}

export default Form;
