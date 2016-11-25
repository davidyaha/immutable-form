import { Map } from 'immutable';

const Manager = {
  forms: Map({}),
  add(form) {
    this.forms = this.forms.set(form.name, form);
  },
  remove(name) {
    this.forms = this.forms.delete(name);
  },
  get(name) {
    return this.forms.get(name);
  },
  reset() {
    this.forms = Map({});
  },
};

export default Manager;
