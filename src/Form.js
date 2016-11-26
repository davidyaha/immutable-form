import { fromJS, Map, Stack } from 'immutable';
import createLogger from 'redux-logger';
import Manager from './Manager';
import createStore from './createStore';

const PATH = 'immutable-form/';
const CLEAR_FORM = `${PATH}CLEAR_FORM`;
const ADD_ERROR = `${PATH}ADD_ERROR`;
const SET_LOADING = `${PATH}SET_LOADING`;
const SET_FIELD = `${PATH}SET_FIELD`;
const REMOVE_FIELD = `${PATH}REMOVE_FIELD`;
const CLEAR_FIELD = `${PATH}/CLEAR_FIELD`;
const CLEAR_ERRORS = `${PATH}CLEAR_ERRORS`;

const defaultOptions = {
  addToManager: true,
  logging: true,
  store: null,
};

const defaultField = Map({
  value: '',
  errors: Stack(),
  warnings: Stack(),
});

const createReducer = initialState =>
  (state = initialState, action) => {
    switch (action.type) {
      case SET_FIELD: {
        const { field, value, error } = action.payload;
        const path = ['fields', field];
        let nextState = state.hasIn(path) ? state : state.setIn(path, defaultField);
        if (value) {
          nextState = nextState.setIn([...path, 'value'], value);
        }
        if (error) {
          const errorsStack = nextState.getIn([...path, 'errors']).push(error);
          nextState = nextState.setIn([...path, 'errors'], errorsStack);
        } else if (error === null) {
          const errorsStack = nextState.getIn([...path, 'errors']).clear();
          nextState = nextState.setIn([...path, 'errors'], errorsStack);
        }
        return nextState;
      }
      case CLEAR_FIELD: {
        const { field } = action.payload;
        return state.setIn(['fields', field], defaultField);
      }
      case REMOVE_FIELD: {
        const { field } = action.payload;
        return state.deleteIn(['fields', field]);
      }
      default:
        break;
    }
    return state;
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
  getState() {
    return this.store.getState().get('form');
  }
  setField(field, { value, error }) {
    this.store.dispatch({
      type: SET_FIELD,
      payload: {
        field,
        value,
        error,
      },
    });
  }
  getField(field) {
    return this.store.getState().getIn(['form', 'fields', field]);
  }
  removeField(field) {
    this.store.dispatch({
      type: REMOVE_FIELD,
      payload: {
        field,
      },
    });
  }
  clearField(field) {
    this.store.dispatch({
      type: CLEAR_FIELD,
      payload: {
        field,
      },
    });
  }
  addError(error) {
    this.store.dipsatch({
      type: ADD_ERROR,
      payload: {
        error,
      },
    });
  }
  clearErrors() {

  }
  hasErrors() {

  }
}

export default Form;
