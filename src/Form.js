import { fromJS } from 'immutable';
import createLogger from 'redux-logger';
import Manager from './Manager';
import createStore from './createStore';

const defaultOptions = {
  addToManager: true,
  logging: true,
  store: null,
};

const createReducer = (initialState) => {
  const reducer = (state = initialState, action) => {
    const nextState = state;
    switch (action.type) {
      default:
        break;
    }
    return nextState;
  };
  return reducer;
};

class Form {
  constructor(name, initialState = fromJS({}), options = defaultOptions) {
    this.name = name;
    this.options = options;
    if (!(typeof this.name === 'string') || this.name.trim().length === 0) {
      throw new Error('Form must have a name');
    }
    const middleware = [];
    if (this.options.logger) {
      middleware.push(createLogger());
    }
    this.store = defaultOptions.store || createStore({
      reducers: {
        form: createReducer(initialState),
      },
      middleware,
    });
    if (options.addToManager) {
      Manager.add(this);
    }
  }
}

export default Form;
