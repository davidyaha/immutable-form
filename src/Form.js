import { Map, Stack } from 'immutable';
import createLogger from 'redux-logger';
import FormCollection from './FormCollection';
import createStore from './createStore';

const PATH = 'immutable-form/';
// Form level
const RESET_FORM = `${PATH}RESET_FORM`;
const CLEAR_ERRORS = `${PATH}CLEAR_ERRORS`;
const ADD_ERROR = `${PATH}ADD_ERROR`;
// Field level
const SET_FIELD = `${PATH}SET_FIELD`;
const REMOVE_FIELD = `${PATH}REMOVE_FIELD`;
const RESET_FIELD = `${PATH}/RESET_FIELD`;

const defaultOptions = {
  addToFormCollection: true,
  logging: true,
  store: null,
};

const initialForm = Map({
  fields: Map(),
  errors: Stack(),
});

const initialField = Map({
  value: '',
  errors: Stack(),
});

const createReducer = initialState =>
  (state = initialState, action) => {
    switch (action.type) {
      case SET_FIELD: {
        const { field, value, error } = action.payload;
        const path = ['fields', field];
        let nextState = state.hasIn(path) ? state : state.setIn(path, initialField);
        if (value) {
          nextState = nextState.setIn([...path, 'value'], value);
        }
        if (error) {
          nextState = nextState.updateIn([...path, 'errors'], errorsStack => errorsStack.push(error));
        } else if (error === null) {
          nextState = nextState.setIn([...path, 'errors'], Stack());
        }
        return nextState;
      }
      case RESET_FIELD: {
        const { field } = action.payload;
        return state.setIn(['fields', field], initialField);
      }
      case REMOVE_FIELD: {
        const { field } = action.payload;
        return state.deleteIn(['fields', field]);
      }
      case ADD_ERROR: {
        const { error } = action.payload;
        const errorsStack = state.get('errors').push(error);
        return state.set('errors', errorsStack);
      }
      case CLEAR_ERRORS: {
        return state.set('errors', Stack());
      }
      case RESET_FORM: {
        return initialForm;
      }
      default:
        break;
    }
    return state;
  };

class Form {
  constructor(name, initialState = initialForm, options = defaultOptions) {
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
    if (options.addToFormCollection) {
      FormCollection.add(this);
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
  resetField(field) {
    this.store.dispatch({
      type: RESET_FIELD,
      payload: {
        field,
      },
    });
  }
  addError(error) {
    this.store.dispatch({
      type: ADD_ERROR,
      payload: {
        error,
      },
    });
  }
  clearErrors() {
    this.store.dispatch({
      type: CLEAR_ERRORS,
    });
  }
  hasErrors() {
    const form = this.getState();
    // Checks all the form's fields for errors and the top level form error
    return form.get('fields').reduce((prev, curr) =>
       prev || (prev === false && curr.get('errors').size > 0)
    , false) || form.get('errors').size > 0;
  }
  resetForm() {
    this.store.dispatch({
      type: RESET_FORM,
    });
  }
}

export default Form;
