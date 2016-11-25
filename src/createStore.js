import { createStore, applyMiddleware, compose } from 'redux';
import { fromJS } from 'immutable';
import { combineReducers } from 'redux-immutable';

export default ({
  reducers = {},
  middleware = [],
  state = fromJS({}),
}) => createStore(
  combineReducers(reducers),
  state,
  compose(
    applyMiddleware(...middleware),
  ),
);
