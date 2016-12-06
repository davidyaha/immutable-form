import { Map, Stack, fromJS } from 'immutable';
import createLogger from 'redux-logger';
import { has, hasIn, keys, isString } from 'lodash';
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
        if (value || value === '') {
          nextState = nextState.setIn([...path, 'value'], value);
        }
        if (error) {
          if (nextState.hasIn([...path, 'errors'])) {
            nextState = nextState.updateIn([...path, 'errors'], errorsStack => errorsStack.push(error));
          } else {
            nextState = nextState.setIn([...path, 'errors'], Stack().push(error));
          }
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
        const errorsStack = state.has('errors') ? state.get('errors').push(error) : Stack().push(error);
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

const reviver = (key, value) => {
  let iterable;
  if (key === 'errors') {
    iterable = value.toStack();
  } else {
    iterable = value.toMap();
  }
  return iterable;
};

export { reviver };

const filterValidate = (state) => {
  let fields = {};
  const form = Object.assign({}, state);
  const fieldValidators = {};
  let formValidators = [];
  if (has(form, 'fields')) {
    fields = keys(form.fields)
        .reduce((res, key) => {
          if (hasIn(form, ['fields', key, 'validate'])) {
            fieldValidators[key] = Array.isArray(form.fields[key].validate)
              ? form.fields[key].validate
              : [form.fields[key].validate];
            delete form.fields[key].validate;
          }
          return { ...res, [key]: form.fields[key] };
        }, {});
  }
  if (has(form, 'validate')) {
    formValidators = Array.isArray(form.validate) ? form.validate : [form.validate];
    delete form.validate;
  }
  const filteredState = {
    ...form,
    fields,
  };
  return { filteredState, fieldValidators, formValidators };
};

export { filterValidate };

class Form {
  constructor(name, initialState, options = defaultOptions) {
    this.name = name;
    this.options = options;
    this.fieldValidators = {};
    this.formValidators = [];
    // Ensure the Form has a name
    if (!(typeof this.name === 'string') || this.name.trim().length === 0) {
      throw new Error('Form must have a name');
    }

    const middleware = [];
    // Add logging middleware
    if (this.options.logger) {
      middleware.push(createLogger());
    }

    // If initial state is provived, need to filter and extract
    // the validation functions.
    let state;
    if (initialState) {
      const { filteredState, fieldValidators, formValidators } = filterValidate(initialState);
      this.fieldValidators = fieldValidators;
      this.formValidators = formValidators;
      state = fromJS(filteredState, reviver);
    } else {
      state = initialForm;
    }

    // Keep track of form and field validation functions
    this.store = defaultOptions.store || createStore({
      reducers: {
        form: createReducer(state),
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
  setField(field, value, error) {
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
       prev || (prev === false && curr.has('errors') && curr.get('errors').size > 0)
    , false) || (form.has('errors') && form.get('errors').size > 0);
  }
  resetForm() {
    this.store.dispatch({
      type: RESET_FORM,
    });
  }
  getFieldValues() {
    const fields = this.getState().get('fields', Map()).map((value, key) => value.get('value'));
    return fields;
  }
  validate() {
    // Run form level validators
    this.formValidators.forEach((validator) => {
      const res = validator(this.getState(), {
        store: this.store,
      });
      if (isString(res)) {
        this.addError(res);
      }
    });

    // Run field level validators
    keys(this.fieldValidators).forEach((key) => {
      this.fieldValidators[key].forEach((validator) => {
        const { value } = this.getField(key);
        const res = validator(value, {
          key,
          store: this.store,
        });
        if (isString(res)) {
          this.setField(key, null, res);
        }
      });
    });

    return !this.hasErrors();
  }
  submit(promise) {
    const store = this.store;
    return new Promise((resolve, reject) => {
      if (this.validate()) {
        promise.then((res) => {
          if (this.onSuccess) {
            this.onSuccess(res, { store });
          }
          resolve(res);
        }).catch((err) => {
          if (this.onFailure) {
            this.onFailure(err, { store });
          }
          reject(err);
        });
      } else {
        reject('Validation failed');
      }
    });
  }
}

export default Form;
