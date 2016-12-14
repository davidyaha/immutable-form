# immutable-form

[![npm](https://img.shields.io/npm/v/immutable-form.svg?maxAge=2592000)](https://www.npmjs.com/package/immutable-form) [![CircleCI](https://circleci.com/gh/Intelight/immutable-form.svg?style=svg)](https://circleci.com/gh/Intelight/immutable-form)

## Getting Started

Install the package

```
yarn install immutable-form
```

To install the latest development version

```
yarn install immutable-form@devel
```

## Documentation

### Overview

The intent of this package is to provide a simple to use implementation of managing form state for React components, streamlining common requirements such as validation, error handling, data fetching and submission.

This package consists of three modules, `Form`, `FormCollection`, and `connectForm`.

`Form` is a class which provides an API to read and write form's state. The state is stored within a [Immutable](https://facebook.github.io/immutable-js/docs/) object which in turn is resides within a [Redux](https://github.com/reactjs/redux/) store.

`FormCollection` holds references to all existing forms. This is useful if you're trying to access form values across different components.

`connectForm` is a React higher order component which passes down `form` and `field` props into your components and re-renders on the form's state changes.

### Creating a form

```javascript
import { Form, connectForm } from 'immutable-form';

// This is just a mock promise for the sake of this code example, in reality this promise should originate from performing an async call to some api.
const createUserPromise = Promise.resolve({
  userId: '123'
})

const userForm = new Form('userForm', {
  fields: {
    username: {
      // All these fields are optional,
      value: 'some value', // Set an initial value
      // Any validation function in validate which returns a string will cause a validation error. Each validation function receives the field value and the form reference as parameters.
      validate: [
        username => username.trim().length === 0 && 'Username cannot be be empty',
      ]
    }
    password: {
      validate: [
        password => password.trim().length < 6 && 'Password must be longer than 6 characters'
      ]
    }
  }
})
// Send a request to the server
.setSubmit((form) => createUserPromise)
// If the promise resolves, do something with the results
.setOnSuccess(({userId}, form) => userId)
// If the promise is rejected, do something.
.setOnFailure((err, form) => err)


const UserForm = ({
  // fields is a an Immutable Map
  fields,
  // This is the `Form` object, you can use it do extra actions such submitting the form.
  form
}) =>
  <div>
    <input
      type="text"
      onChange={(e) => form.setField('username', e.target.value)}
      value={fields.getIn(['username', 'value'])}
    />
    {fields.getIn(['username', 'errors'].first())}
    <input
      type="text"
      onChange={(e) => form.setField('password', e.target.value)}
      value={fields.getIn(['password', 'value'])}
    />
    {fields.getIn(['password', 'errors'].first())}
    <button onClick={() => form.submit()} />
  </div>

export default connectForm(userForm)(UserForm);

```

### Loading async data into the form

```javascript
import { Form, connectForm } from 'immutable-form';

// This is just a mock promise for the sake of this code example, in reality this promise should originate from performing an async call to some api.
const loadFormPromise = Promise.resolve({
  username: 'someusername',
  password: 'somepassword'
});

const userForm = new Form('userForm', {
  fields: {
    username: {
      validate: [
        username => username.trim().length === 0 && 'Username cannot be be empty',
      ]
    }
    password: {
      validate: [
        password => password.trim().length < 6 && 'Password must be longer than 6 characters'
      ]
    }
  }
})
.setLoad(form => loadFormPromise.then(({ username, password }) => {
  // When the promise resolves with the requested data
  // you need to manually wire it into the form.
  form.setField('username', username);
  form.setField('email', email);
}));

```

If using `connectForm` the load promise will be called automatically in the component's lifecycle. To trigger a manual load, call `form.load()`.

### Creating a Form with extra options

```javascript
import { Form, connectForm } from 'immutable-form';

const Form = new Form('form', {}, {
    logger: true, // Will enable redux-logger (false by default)
    addToFormCollection: true, // Refrains from adding a reference to FormCollection, (true by default)
})
```
