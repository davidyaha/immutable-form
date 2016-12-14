import React from 'react';
import { isFunction } from 'lodash';
import FormCollection from './FormCollection';

const connectForm = form => (Component) => {
  class Wrapper extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.state = {
        loaded: false,
      };
    }
    async componentDidMount() {
      this.form = (isFunction(form) ? form : () => form)();
      this.unsubscribe = this.form.store.subscribe(() => {
        this.forceUpdate();
      });
      if (isFunction(this.form.loadPromise)) {
        await this.form.load();
        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({
          loaded: true,
        });
      } else {
        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({
          loaded: true,
        });
      }
    }
    componentWillUnmount() {
      this.unsubscribe();
      FormCollection.remove(this.form.name);
      this.setState({
        loaded: false,
      });
    }
    render() {
      if (this.state.loaded) {
        const fields = this.form.getFields();
        return React.cloneElement(Component, {
          ...this.props,
          fields,
          form: this.form,
        });
      }
      return null;
    }
  }

  return Wrapper;
};

export default connectForm;
